import lotService from './lot.service.js';

const lotController = {
  // POST /api/lots
  async createLot(req, res, next) {
    try {
      const lot = await lotService.createLot(req.user.id, req.user.role, req.body);
      res.status(201).json({ success: true, lot });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/lots  (browse active lots)
  async listActiveLots(req, res, next) {
    try {
      const { cropName, district, quality, page, limit } = req.query;
      const result = await lotService.listActiveLots({ cropName, district, quality, page, limit });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/lots/mine
  async getMyLots(req, res, next) {
    try {
      const lots = await lotService.getMyLots(req.user.id);
      res.status(200).json({ success: true, lots });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/lots/stats
  async getMyStats(req, res, next) {
    try {
      const activeCount = await lotService.countMyActiveLots(req.user.id);
      res.status(200).json({ success: true, activeCount });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/lots/:id
  async getLotById(req, res, next) {
    try {
      const lot = await lotService.getLotById(req.params.id);
      if (!lot) {
        return res.status(404).json({ success: false, error: 'Lot not found' });
      }
      res.status(200).json({ success: true, lot });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/lots/:id
  async updateLot(req, res, next) {
    try {
      const lot = await lotService.updateLot(req.params.id, req.user.id, req.body);
      if (!lot) {
        return res.status(404).json({ success: false, error: 'Lot not found or you are not the owner' });
      }
      res.status(200).json({ success: true, lot });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/lots/:id/close
  async closeLot(req, res, next) {
    try {
      const lot = await lotService.closeLot(req.params.id, req.user.id);
      if (!lot) {
        return res.status(404).json({ success: false, error: 'Lot not found or you are not the owner' });
      }
      res.status(200).json({ success: true, lot });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/lots/meta/crops
  async getDistinctCrops(req, res, next) {
    try {
      const crops = await lotService.getDistinctCrops();
      res.status(200).json({ success: true, crops });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/lots/meta/districts
  async getDistinctDistricts(req, res, next) {
    try {
      const districts = await lotService.getDistinctDistricts();
      res.status(200).json({ success: true, districts });
    } catch (err) {
      next(err);
    }
  },
};

export default lotController;
