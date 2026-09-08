// Standardized unit conversion to quintals
const toQuintals = (qty, unit = 'quintal') => {
  const q = Number(qty) || 0;
  switch ((unit || '').toLowerCase()) {
    case 'kg':
      return q / 100;
    case 'tonne':
      return q * 10;
    case 'quintal':
    default:
      return q;
  }
};

// Deterministic inter-district road distances in Maharashtra (in km)
const DISTRICT_DISTANCES = {
  'nashik-pune': 210,
  'pune-nashik': 210,
  'nashik-solapur': 370,
  'solapur-nashik': 370,
  'nashik-aurangabad': 160,
  'aurangabad-nashik': 160,
  'nashik-kolhapur': 440,
  'kolhapur-nashik': 440,
  'pune-solapur': 250,
  'solapur-pune': 250,
  'pune-aurangabad': 230,
  'aurangabad-pune': 230,
  'pune-kolhapur': 235,
  'kolhapur-pune': 235,
  'solapur-aurangabad': 310,
  'aurangabad-solapur': 310,
  'solapur-kolhapur': 230,
  'kolhapur-solapur': 230,
  'aurangabad-kolhapur': 470,
  'kolhapur-aurangabad': 470,
};

const getEstimatedDistanceKm = (originDistrict, destDistrict, originState = 'Maharashtra', destState = 'Maharashtra') => {
  const oDist = (originDistrict || '').trim().toLowerCase();
  const dDist = (destDistrict || '').trim().toLowerCase();

  if (!oDist || !dDist) return 30; // default local haulage
  if (oDist === dDist) return 25; // intra-district average farm-to-depot distance

  const key = `${oDist}-${dDist}`;
  if (DISTRICT_DISTANCES[key]) return DISTRICT_DISTANCES[key];

  if ((originState || '').toLowerCase() === (destState || '').toLowerCase()) {
    return 150; // average intra-state cross-district estimate
  }
  return 400; // inter-state estimate
};

const realizationService = {
  /**
   * Look up or estimate road transit distance between two locations.
   */
  getDistanceKm(originDistrict, destDistrict, originState, destState) {
    return getEstimatedDistanceKm(originDistrict, destDistrict, originState, destState);
  },

  /**
   * Calculate deterministic Net Realization for a produce sale opportunity.
   *
   * @param {Object} params
   * @param {number} params.quantity - Quantity of produce
   * @param {string} [params.unit='quintal'] - Unit (quintal, kg, tonne)
   * @param {number} params.unitPrice - Price per unit/quintal
   * @param {Object} [params.originLocation] - Origin location { district, state }
   * @param {Object} [params.destinationLocation] - Destination location { district, state }
   * @param {string} [params.channelType='buyer'] - 'buyer' (direct) or 'mandi' (APMC)
   * @param {boolean} [params.buyerArrangedTransport=false] - If buyer bears logistics
   * @param {number} [params.storageDays=0] - Temporary holding duration before sale
   * @param {Object} [params.customCosts={}] - Optional manual override/additional deductions
   */
  calculateNetRealization({
    quantity,
    unit = 'quintal',
    unitPrice,
    originLocation = {},
    destinationLocation = {},
    channelType = 'buyer',
    buyerArrangedTransport = false,
    storageDays = 0,
    customCosts = {},
  }) {
    const qtyQ = toQuintals(quantity, unit);
    const pricePerQ = Number(unitPrice) || 0;

    if (qtyQ <= 0 || pricePerQ <= 0) {
      return {
        grossValue: 0,
        transportCost: 0,
        mandiCess: 0,
        handlingCost: 0,
        storageCost: 0,
        otherDeductions: 0,
        totalDeductions: 0,
        estimatedNetRealization: 0,
        netPerQuintal: 0,
        effectiveMarginPercent: 0,
        distanceKm: 0,
        assumptions: ['Zero or invalid quantity/price supplied.'],
        disclaimer: 'All net realization calculations are non-binding estimates based on prevailing tariffs.',
      };
    }

    const assumptions = [];

    // 1. Gross Value
    const grossValue = Number((qtyQ * pricePerQ).toFixed(2));

    // 2. Logistics & Transport Costs
    let transportCost = 0;
    const distanceKm = getEstimatedDistanceKm(
      originLocation.district,
      destinationLocation.district,
      originLocation.state,
      destinationLocation.state
    );

    if (buyerArrangedTransport) {
      transportCost = 0;
      assumptions.push('Buyer arranges direct farm-gate pickup (₹0 seller transport deduction).');
    } else {
      // Benchmark freight tariff:
      // Base loading/unloading: ₹15/quintal
      // Transit freight: ₹0.40 per quintal per km
      const baseLoading = 15 * qtyQ;
      const transitFreight = 0.40 * distanceKm * qtyQ;
      transportCost = Number((baseLoading + transitFreight).toFixed(2));

      assumptions.push(
        `Estimated freight for ${qtyQ} quintals over ${distanceKm} km (₹15/q loading + ₹0.40/q/km transit rate = ₹${transportCost.toLocaleString('en-IN')}).`
      );
    }

    // 3. Channel Specific Deductions
    let mandiCess = 0;
    let handlingCost = 0;

    if (channelType === 'mandi') {
      // APMC mandi sales incur 1.5% statutory cess + ₹10/q weighing/handling fees
      mandiCess = Number((grossValue * 0.015).toFixed(2));
      handlingCost = Number((10 * qtyQ).toFixed(2));
      assumptions.push('APMC mandi transaction incur 1.5% statutory market fee and ₹10/q weighing charges.');
    } else {
      // Direct buyer sale avoids APMC cess and intermediary commission
      mandiCess = 0;
      handlingCost = Number((5 * qtyQ).toFixed(2)); // minimal farm-gate bagging/handling
      assumptions.push('Direct buyer procurement eliminates 1.5% APMC cess and intermediary commission.');
    }

    // 4. Storage Costs (if holding produce)
    let storageCost = 0;
    const days = Math.max(0, Number(storageDays) || 0);
    if (days > 0) {
      storageCost = Number((2.0 * qtyQ * days).toFixed(2)); // ₹2.0/q/day standard warehousing tariff
      assumptions.push(`Temporary warehousing tariff applied for ${days} days at ₹2.0/q/day.`);
    }

    // 5. Custom / Other Deductions
    const otherDeductions = Number((Number(customCosts.other) || 0).toFixed(2));
    if (otherDeductions > 0) {
      assumptions.push(`Custom declared deduction: ₹${otherDeductions.toLocaleString('en-IN')}.`);
    }

    // 6. Net Totals
    const totalDeductions = Number(
      (transportCost + mandiCess + handlingCost + storageCost + otherDeductions).toFixed(2)
    );

    const estimatedNetRealization = Number(Math.max(0, grossValue - totalDeductions).toFixed(2));
    const netPerQuintal = Number((estimatedNetRealization / qtyQ).toFixed(2));
    const effectiveMarginPercent = grossValue > 0
      ? Number(((estimatedNetRealization / grossValue) * 100).toFixed(1))
      : 0;

    return {
      quantity: qtyQ,
      unit: 'quintal',
      unitPrice: pricePerQ,
      grossValue,
      transportCost,
      mandiCess,
      handlingCost,
      storageCost,
      otherDeductions,
      totalDeductions,
      estimatedNetRealization,
      netPerQuintal,
      effectiveMarginPercent,
      distanceKm,
      channelType,
      assumptions,
      disclaimer:
        'DISCLAIMER: All figures are non-binding estimates based on prevailing market tariffs and stated target prices. Actual realization may vary based on vehicle availability, road tolls, and physical inspection of produce quality at point of delivery.',
    };
  },
};

export default realizationService;
