import realizationService from './realization.service.js';

const realizationController = {
  // POST /api/realization/estimate
  estimate(req, res, next) {
    try {
      const {
        quantity,
        unit = 'quintal',
        unitPrice,
        offeredPrice,
        price,
        originLocation,
        originDistrict,
        originState,
        destinationLocation,
        destinationDistrict,
        destDistrict,
        destState,
        channelType,
        buyerType,
        buyerArrangedTransport,
        storageDays,
        storageCost,
        handlingCostPerUnit,
        customCosts = {},
      } = req.body;

      const finalPrice = unitPrice || offeredPrice || price;
      if (!quantity || Number(quantity) <= 0) {
        return res.status(400).json({ success: false, error: 'Valid quantity is required' });
      }
      if (!finalPrice || Number(finalPrice) <= 0) {
        return res.status(400).json({ success: false, error: 'Valid unit price is required' });
      }

      const oLoc = originLocation || {
        district: originDistrict,
        state: originState || 'Maharashtra',
      };

      const dLoc = destinationLocation || {
        district: destinationDistrict || destDistrict,
        state: destState || 'Maharashtra',
      };

      const finalCustomCosts = { ...customCosts };
      if (storageCost !== undefined && !finalCustomCosts.storage) {
        finalCustomCosts.storage = storageCost;
      }

      const estimate = realizationService.calculateNetRealization({
        quantity: Number(quantity),
        unit,
        unitPrice: Number(finalPrice),
        originLocation: oLoc,
        destinationLocation: dLoc,
        channelType: channelType || buyerType || 'buyer',
        buyerArrangedTransport: Boolean(buyerArrangedTransport),
        storageDays: Number(storageDays) || 0,
        customCosts: finalCustomCosts,
      });

      // Provide both clean breakdown structure and flat fields for maximum consumer convenience
      const responseData = {
        ...estimate,
        breakdown: {
          grossRevenue: estimate.grossValue,
          logisticsCost: {
            distanceKm: estimate.distanceKm,
            totalTransportCost: estimate.transportCost,
          },
          mandiCess: estimate.mandiCess,
          handlingCost: estimate.handlingCost,
          storageCost: estimate.storageCost,
          otherDeductions: estimate.otherDeductions,
          totalDeductions: estimate.totalDeductions,
          netRealisationAmount: estimate.estimatedNetRealization,
          netRealisationPerUnit: estimate.netPerQuintal,
          marginPercent: estimate.effectiveMarginPercent,
        },
      };

      res.status(200).json({
        success: true,
        data: responseData,
        estimate: responseData,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default realizationController;
