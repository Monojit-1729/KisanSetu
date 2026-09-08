import { User } from '../users/index.js';
import { FarmerProfile } from '../farmers/index.js';
import { MarketPrice, marketService } from '../markets/index.js';
import { Demand } from '../demand/index.js';
import { realizationService } from '../realization/index.js';
import parseSmsMessage from './sms.parser.js';
import SmsLog from './sms.model.js';

// In-memory active session cache for quick keypad follow-up BUY commands
// Phone digits -> { crop, quantity, unit, options: { A: {...}, B: {...} }, expiresAt }
const activeSessions = new Map();

/**
 * Normalize phone number by extracting the last 10 digits.
 * Handles '+91', leading zeros, spaces, hyphens, etc.
 */
export const normalizePhoneDigits = (rawPhone = '') => {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  const digits = rawPhone.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

export const smsService = {
  /**
   * Find a registered farmer by phone number.
   */
  async lookupFarmer(rawPhone) {
    const last10 = normalizePhoneDigits(rawPhone);
    if (!last10 || last10.length < 10) return null;

    // Search user by regex matching last 10 digits allowing optional intervening whitespace/hyphens
    const pattern = last10.split('').join('\\D*');
    const user = await User.findOne({
      phone: { $regex: new RegExp(pattern) },
      role: { $in: ['farmer', 'fpo'] },
    }).lean();

    if (!user) return null;

    // Fetch farmer profile for district / location context
    const profile = await FarmerProfile.findOne({ user: user._id }).lean();

    return {
      id: user._id.toString(),
      name: user.name,
      role: user.role,
      phone: user.phone,
      district: profile?.location?.district || 'Nashik',
      state: profile?.location?.state || 'Maharashtra',
      village: profile?.location?.village || '',
      taluka: profile?.location?.taluka || '',
    };
  },

  /**
   * Process an incoming SMS message from a given phone number.
   *
   * @param {string} rawPhone - Mobile number of sender
   * @param {string} message - Raw SMS text received
   * @returns {Promise<{ success: boolean, response: string, parsedCommand: Object, farmer: Object|null }>}
   */
  async processSms(rawPhone, message) {
    const phoneDigits = normalizePhoneDigits(rawPhone);
    const parsed = parseSmsMessage(message);

    // 1. Validate Farmer Registration
    const farmer = await this.lookupFarmer(rawPhone);

    if (!farmer) {
      const response = 'Phone number not registered. Please complete registration first.';
      await this.logMessage({
        phone: rawPhone,
        farmer: null,
        farmerName: '',
        incomingMessage: message,
        outgoingResponse: response,
        command: parsed.command,
        status: 'rejected',
      });

      return {
        success: false,
        response,
        parsedCommand: parsed,
        farmer: null,
      };
    }

    let response = '';

    // 2. Handle Commands
    switch (parsed.command) {
      case 'HELP':
        response = this.buildHelpResponse();
        break;

      case 'SELL':
        if (!parsed.isValid) {
          response = parsed.error || this.buildInvalidResponse(message);
        } else {
          response = await this.handleSellCommand(farmer, phoneDigits, parsed);
        }
        break;

      case 'BUY':
        if (!parsed.isValid) {
          response = 'KisanSetu: Invalid code. Send BUY A or BUY B.';
        } else {
          response = await this.handleBuyCommand(farmer, phoneDigits, parsed.buyerCode);
        }
        break;

      case 'EMPTY':
      case 'UNKNOWN':
      default:
        response = this.buildInvalidResponse(message);
        break;
    }

    // 3. Log interaction
    const session = activeSessions.get(phoneDigits);
    await this.logMessage({
      phone: rawPhone,
      farmer: farmer.id,
      farmerName: farmer.name,
      incomingMessage: message,
      outgoingResponse: response,
      command: parsed.command,
      status: 'success',
      sessionData: session || null,
    });

    return {
      success: true,
      response,
      parsedCommand: parsed,
      farmer: {
        name: farmer.name,
        phone: farmer.phone,
        district: farmer.district,
      },
    };
  },

  /**
   * Handle the SELL <quantity> <crop> command.
   * Integrates directly with A4 realizationService and APMC market prices.
   */
  async handleSellCommand(farmer, phoneDigits, parsed) {
    const { quantity, unit, crop } = parsed;
    const district = farmer.district || 'Nashik';

    // Standardize to quintals for A4 realization calculations
    let qtyQuintals = quantity;
    if (unit === 'kg') qtyQuintals = quantity / 100;
    else if (unit === 'tonne') qtyQuintals = quantity * 10;
    qtyQuintals = Math.max(0.1, Number(qtyQuintals.toFixed(2)));

    // 1. Fetch APMC Market Benchmark Price
    let marketBenchmark = await marketService.getLatestPriceForCrop(crop, district);
    if (!marketBenchmark) {
      marketBenchmark = await MarketPrice.findOne({
        cropName: { $regex: new RegExp(`^${crop}$`, 'i') },
      })
        .sort({ arrivalDate: -1 })
        .lean();
    }

    const modalPricePerQ = marketBenchmark?.modalPrice || 2400;
    const marketPricePerKg = Math.max(1, Math.round(modalPricePerQ / 100));

    // 2. Compute APMC Mandi Net Realization via A4 realizationService
    const mandiCalc = realizationService.calculateNetRealization({
      quantity: qtyQuintals,
      unit: 'quintal',
      unitPrice: modalPricePerQ,
      originLocation: { district, state: farmer.state },
      destinationLocation: { district, state: farmer.state },
      channelType: 'mandi',
    });

    const mandiNetPerKg = Math.max(1, Math.round((mandiCalc.netPerQuintal || 0) / 100));
    const transportPerKg = Math.max(1, Math.round((mandiCalc.transportCost || 0) / (qtyQuintals * 100)));
    const otherCostsPerKg = Math.max(
      1,
      Math.round(((mandiCalc.mandiCess || 0) + (mandiCalc.handlingCost || 0)) / (qtyQuintals * 100))
    );

    // 3. Match Available Direct Buyers for this Crop
    const matchingDemands = await Demand.find({
      cropName: { $regex: new RegExp(`^${crop}$`, 'i') },
      status: 'active',
    })
      .populate('buyer', 'name email businessName')
      .limit(5)
      .lean();

    const buyerOpportunities = [];

    for (const demand of matchingDemands) {
      const buyerName =
        demand.buyer?.businessName ||
        demand.buyer?.name ||
        demand.deliveryLocation?.facilityAddress ||
        'Institutional Buyer';

      const buyerDistrict = demand.deliveryLocation?.district || district;
      const targetPricePerQ = demand.targetPrice || modalPricePerQ;

      const buyerCalc = realizationService.calculateNetRealization({
        quantity: qtyQuintals,
        unit: 'quintal',
        unitPrice: targetPricePerQ,
        originLocation: { district, state: farmer.state },
        destinationLocation: { district: buyerDistrict, state: demand.deliveryLocation?.state || farmer.state },
        channelType: 'buyer',
      });

      const offerPricePerKg = Math.max(1, Math.round(targetPricePerQ / 100));
      const netPerKg = Math.max(1, Math.round((buyerCalc.netPerQuintal || 0) / 100));

      buyerOpportunities.push({
        type: 'buyer',
        demandId: demand._id.toString(),
        buyerId: demand.buyer?._id?.toString() || demand.buyer?.id,
        name: buyerName,
        district: buyerDistrict,
        offerPricePerKg,
        netPerKg,
        totalNet: buyerCalc.estimatedNetRealization,
      });
    }

    // Sort buyer opportunities by highest net realization
    buyerOpportunities.sort((a, b) => b.netPerKg - a.netPerKg);

    // 4. Assemble Top 3 Options (A, B, C)
    const options = {};
    const optionLabels = ['A', 'B', 'C'];
    const suitableLines = [];

    // Add top buyer matches
    let labelIdx = 0;
    for (const opp of buyerOpportunities) {
      if (labelIdx >= 2) break; // Leave room for APMC Mandi benchmark
      const code = optionLabels[labelIdx];
      options[code] = {
        code,
        type: 'buyer',
        name: opp.name,
        demandId: opp.demandId,
        buyerId: opp.buyerId,
        pricePerKg: opp.offerPricePerKg,
        netPerKg: opp.netPerKg,
        crop,
        quantity,
        unit,
      };
      suitableLines.push(`${labelIdx + 1}. ${opp.name}`);
      labelIdx++;
    }

    // Always include Local APMC Mandi option
    const mandiCode = optionLabels[labelIdx] || 'C';
    options[mandiCode] = {
      code: mandiCode,
      type: 'mandi',
      name: `${district} APMC Mandi`,
      pricePerKg: marketPricePerKg,
      netPerKg: mandiNetPerKg,
      crop,
      quantity,
      unit,
    };
    suitableLines.push(`${labelIdx + 1}. ${district} APMC Mandi`);

    // Cache active session for follow-up BUY command (valid for 24 hours)
    activeSessions.set(phoneDigits, {
      crop,
      quantity,
      unit,
      options,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // 5. Format Concise SMS Response (matching prompt requirements)
    return `KisanSetu:
${crop} market price: ₹${marketPricePerKg}/kg
Estimated transport: ₹${transportPerKg}/kg
Other estimated costs: ₹${otherCostsPerKg}/kg
Estimated net realization: ₹${mandiNetPerKg}/kg

Suitable buyers:
${suitableLines.join('\n')}

Reply:
BUY A`;
  },

  /**
   * Handle follow-up BUY <buyer-code> command.
   */
  async handleBuyCommand(farmer, phoneDigits, buyerCode) {
    const code = (buyerCode || '').toUpperCase();
    const session = activeSessions.get(phoneDigits);

    if (!session || !session.options || !session.options[code]) {
      return `KisanSetu: Option "${code}" not found or expired. Reply "SELL 2000 TOMATO" to view fresh quotes and buyer matches.`;
    }

    const selectedOption = session.options[code];
    const buyerDisplayName = selectedOption.name || `Buyer ${code}`;

    // Clear or update session so repeat commands don't double trigger
    activeSessions.delete(phoneDigits);

    return `KisanSetu:
${buyerDisplayName} selected. Your selling request has been recorded.
Our local field representative will contact you at ${farmer.phone} to coordinate pickup.`;
  },

  /**
   * Compact Help command response.
   */
  buildHelpResponse() {
    return `KisanSetu SMS Commands:
SELL <quantity> <crop>
BUY <buyer-code>
HELP

Examples:
SELL 2000 TOMATO
BUY A`;
  },

  /**
   * Compact Invalid usage response.
   */
  buildInvalidResponse(rawMessage) {
    return `KisanSetu:
Invalid command.
To sell produce:
SELL <quantity> <crop>
Example: SELL 2000 TOMATO
Or reply: HELP`;
  },

  /**
   * Get interaction history for a phone number.
   */
  async getHistory(rawPhone, limit = 20) {
    const last10 = normalizePhoneDigits(rawPhone);
    if (!last10) return [];

    const pattern = last10.split('').join('\\D*');
    return SmsLog.find({
      phone: { $regex: new RegExp(pattern) },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
  },

  /**
   * Helper to persist message interaction to MongoDB.
   */
  async logMessage(logData) {
    try {
      await SmsLog.create(logData);
    } catch (err) {
      console.warn('[SmsService] Could not persist SMS log:', err.message);
    }
  },

  /**
   * Retrieve list of registered demo farmers for simulator dropdown.
   */
  async getDemoFarmers() {
    const farmers = await User.find({ role: 'farmer' })
      .select('name phone email')
      .limit(5)
      .lean();

    return farmers.map((f) => ({
      id: f._id.toString(),
      name: f.name,
      phone: f.phone || '+91 98230 11223',
    }));
  },
};

export default smsService;
