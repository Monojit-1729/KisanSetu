import matchingService from './matching.service.js';

const matchingController = {
  // GET /api/matching/buyer/:demandId (Buyer only)
  async getMatchesForDemand(req, res, next) {
    try {
      const result = await matchingService.findMatchesForDemand(req.params.demandId);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Demand not found' });
      }
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/matching/lot/:lotId (Farmer/FPO only)
  async getMatchesForLot(req, res, next) {
    try {
      const result = await matchingService.findMatchesForLot(req.params.lotId);
      if (!result) {
        return res.status(404).json({ success: false, error: 'Lot not found' });
      }
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/matching/my-lots-summary (Farmer/FPO only)
  async getMyLotsSummary(req, res, next) {
    try {
      const summary = await matchingService.getMyLotsMatchSummary(req.user.id);
      res.status(200).json({ success: true, ...summary });
    } catch (err) {
      next(err);
    }
  },
};

export default matchingController;
