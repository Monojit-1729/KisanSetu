import mongoose from 'mongoose';
import { Lot } from '../lots/index.js';
import { MarketPrice, marketService } from '../markets/index.js';
import { BuyerProfile } from '../buyers/index.js';
import { matchingService } from '../matching/index.js';
import { realizationService } from '../realization/index.js';
import scoringService from './scoring.service.js';
import { escapeRegex } from '../../utils/regex.js';

const recommendationService = {
  /**
   * Generate explainable, ranked recommendations for a farmer or FPO produce lot.
   *
   * @param {string} lotId - ID of the produce lot
   * @param {string} userId - ID of the requesting user
   * @param {string} [userRole='farmer'] - Role of the requesting user
   */
  async getLotRecommendations(lotId, userId, userRole) {
    const isObjectId = mongoose.Types.ObjectId.isValid(lotId);
    const query = isObjectId ? { $or: [{ _id: lotId }, { lotId }] } : { lotId };
    const lot = await Lot.findOne(query).populate('owner', 'name email role').lean();
    if (!lot) {
      const err = new Error('Lot not found');
      err.statusCode = 404;
      throw err;
    }

    // Access authorization: only owner or admin can request recommendations
    const ownerIdStr = lot.owner?._id?.toString() || lot.owner?.id || (typeof lot.owner === 'object' ? lot.owner.toString() : lot.owner);
    if (userRole !== 'admin' && ownerIdStr !== userId.toString()) {
      const err = new Error('Unauthorized to generate recommendations for this lot');
      err.statusCode = 403;
      throw err;
    }

    if (lot.status === 'closed' || lot.status === 'sold') {
      return {
        lotSummary: {
          id: lot._id.toString(),
          cropName: lot.cropName,
          status: lot.status,
          quantity: lot.quantity,
          unit: lot.unit,
        },
        rankedOpportunities: [],
        recommendedTopOption: null,
        message: `This lot is currently marked as ${lot.status}. Recommendations are only active for available produce listings.`,
        disclaimer: 'All figures are non-binding estimates based on prevailing market tariffs.',
      };
    }

    // 1. Fetch APMC Market Benchmark
    const originDistrict = lot.location?.district || 'Nashik';
    let marketBenchmark = await marketService.getLatestPriceForCrop(lot.cropName, originDistrict);

    if (!marketBenchmark) {
      // Try state-level recent price if district has no entries
      const recentStatewide = await MarketPrice.findOne({
        cropName: { $regex: `^${escapeRegex(lot.cropName)}$`, $options: 'i' },
      })
        .sort({ arrivalDate: -1 })
        .lean();

      if (recentStatewide) {
        marketBenchmark = {
          ...recentStatewide,
          id: recentStatewide._id.toString(),
          isStatewideFallback: true,
        };
      }
    }

    // 2. Fetch Compatible Buyer Demands via A3 Matching Engine
    const matchingResult = await matchingService.findMatchesForLot(lotId);
    const matchedDemands = matchingResult?.matches || [];

    const evaluatedOpportunities = [];

    // --- Channel A: Evaluate Each Matched Direct Buyer ---
    for (const match of matchedDemands) {
      const demand = match.demand;
      const buyerId = demand.buyer?.id || demand.buyer?._id;

      // Look up buyer profile for verification / trust signals
      let buyerProfile = null;
      if (buyerId) {
        buyerProfile = await BuyerProfile.findOne({ user: buyerId }).lean();
      }

      // Unit price to evaluate: buyer targetPrice or lot price or market price
      const offerPrice = demand.targetPrice || marketBenchmark?.modalPrice || lot.pricePerQuintal;

      // Calculate Net Realization for direct buyer channel
      const realization = realizationService.calculateNetRealization({
        quantity: lot.quantity,
        unit: lot.unit,
        unitPrice: offerPrice,
        originLocation: lot.location,
        destinationLocation: demand.deliveryLocation,
        channelType: 'buyer',
      });

      // Calculate Deterministic Multi-Factor Opportunity Score
      const scoring = scoringService.scoreOpportunity({
        lot,
        channelType: 'buyer',
        realization,
        buyerProfile,
        demand,
        marketBenchmark,
      });

      evaluatedOpportunities.push({
        opportunityId: `BUYER-${demand.id}`,
        channelType: 'buyer',
        title: `Direct Sale to ${buyerProfile?.businessName || demand.buyer?.name || 'Verified Buyer'}`,
        partnerName: buyerProfile?.businessName || demand.buyer?.name || 'Commercial Buyer',
        destinationLocation: demand.deliveryLocation?.district || 'Local Hub',
        unitPrice: offerPrice,
        estimatedNetRealization: realization.estimatedNetRealization,
        netPerQuintal: realization.netPerQuintal,
        effectiveMarginPercent: realization.effectiveMarginPercent,
        overallScore: scoring.overallScore,
        scoreBreakdown: scoring.breakdown,
        reasons: scoring.reasons,
        realization,
        buyerMetadata: {
          id: buyerId ? buyerId.toString() : null,
          businessName: buyerProfile?.businessName || demand.buyer?.name,
          buyerType: buyerProfile?.buyerType || 'wholesaler',
          isVerified: buyerProfile?.isVerified || false,
        },
        demandMetadata: {
          id: demand.id,
          demandId: demand.demandId,
          quantity: demand.quantity,
          unit: demand.unit,
          quality: demand.quality,
          targetPrice: demand.targetPrice,
          deliveryWindow: demand.deliveryWindow,
        },
      });
    }

    // --- Channel B: Evaluate Local / Benchmark APMC Mandi Yard ---
    if (marketBenchmark && marketBenchmark.modalPrice > 0) {
      const mandiRealization = realizationService.calculateNetRealization({
        quantity: lot.quantity,
        unit: lot.unit,
        unitPrice: marketBenchmark.modalPrice,
        originLocation: lot.location,
        destinationLocation: {
          district: marketBenchmark.district,
          state: marketBenchmark.state || 'Maharashtra',
        },
        channelType: 'mandi',
      });

      const mandiScoring = scoringService.scoreOpportunity({
        lot,
        channelType: 'mandi',
        realization: mandiRealization,
        marketBenchmark,
      });

      evaluatedOpportunities.push({
        opportunityId: `MANDI-${marketBenchmark.id || marketBenchmark.mandiName}`,
        channelType: 'mandi',
        title: `Open Auction at ${marketBenchmark.mandiName} APMC`,
        partnerName: `${marketBenchmark.mandiName} APMC Yard`,
        destinationLocation: marketBenchmark.district,
        unitPrice: marketBenchmark.modalPrice,
        estimatedNetRealization: mandiRealization.estimatedNetRealization,
        netPerQuintal: mandiRealization.netPerQuintal,
        effectiveMarginPercent: mandiRealization.effectiveMarginPercent,
        overallScore: mandiScoring.overallScore,
        scoreBreakdown: mandiScoring.breakdown,
        reasons: mandiScoring.reasons,
        realization: mandiRealization,
        marketMetadata: {
          mandiName: marketBenchmark.mandiName,
          district: marketBenchmark.district,
          modalPrice: marketBenchmark.modalPrice,
          minPrice: marketBenchmark.minPrice,
          maxPrice: marketBenchmark.maxPrice,
          arrivalDate: marketBenchmark.arrivalDate,
          freshnessNotice: marketBenchmark.arrivalDate
            ? `Based on APMC arrival data from ${new Date(marketBenchmark.arrivalDate).toLocaleDateString('en-IN')}`
            : 'Prevailing APMC monthly average tariff',
        },
      });
    }

    // Sort all opportunities by overallScore descending (best opportunity first)
    evaluatedOpportunities.sort((a, b) => b.overallScore - a.overallScore);

    const topOption = evaluatedOpportunities[0] || null;

    let explanation = 'No viable commercial opportunities found for this lot.';
    if (topOption) {
      if (topOption.channelType === 'buyer') {
        explanation = `Selling directly to ${topOption.partnerName} is the highest ranked opportunity (Score: ${topOption.overallScore}/100) because it delivers an estimated net realization of ₹${topOption.netPerQuintal?.toLocaleString('en-IN')}/q (₹${topOption.estimatedNetRealization?.toLocaleString('en-IN')} total), eliminates APMC cess, and partners with an established commercial buyer.`;
      } else {
        explanation = `Selling at ${topOption.partnerName} is the highest ranked opportunity (Score: ${topOption.overallScore}/100) offering standard APMC market liquidity at an estimated net realization of ₹${topOption.netPerQuintal?.toLocaleString('en-IN')}/q.`;
      }
    }

    return {
      lotSummary: {
        id: lot._id.toString(),
        cropName: lot.cropName,
        variety: lot.variety,
        quantity: lot.quantity,
        unit: lot.unit,
        quality: lot.quality,
        askingPricePerQuintal: lot.pricePerQuintal,
        location: lot.location,
        availableFrom: lot.availableFrom,
      },
      marketBenchmark: marketBenchmark
        ? {
            mandiName: marketBenchmark.mandiName,
            district: marketBenchmark.district,
            modalPrice: marketBenchmark.modalPrice,
            minPrice: marketBenchmark.minPrice,
            maxPrice: marketBenchmark.maxPrice,
            arrivalDate: marketBenchmark.arrivalDate,
            freshnessNotice: `Based on APMC mandi data from ${new Date(marketBenchmark.arrivalDate).toLocaleDateString('en-IN')}`,
          }
        : null,
      totalOpportunitiesCount: evaluatedOpportunities.length,
      rankedOpportunities: evaluatedOpportunities,
      recommendedTopOption: topOption,
      explanation,
      generatedAt: new Date().toISOString(),
      disclaimer:
        'IMPORTANT: All financial and score outputs are deterministic decision-support estimates based on current buyer target prices and APMC market arrivals. Actual returns depend on final physical quality inspection, vehicle availability, and mutual agreement.',
    };
  },
};

export default recommendationService;
