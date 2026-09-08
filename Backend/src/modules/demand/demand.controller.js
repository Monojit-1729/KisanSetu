import demandService from './demand.service.js';

const demandController = {
  // POST /api/demand
  async createDemand(req, res, next) {
    try {
      const demand = await demandService.createDemand(req.user.id, req.body);
      res.status(201).json({ success: true, demand });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/demand/my
  async getMyDemands(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = await demandService.getMyDemands(req.user.id, { status, page, limit });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/demand/stats
  async getMyStats(req, res, next) {
    try {
      const stats = await demandService.getMyStats(req.user.id);
      res.status(200).json({ success: true, ...stats });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/demand (browse demands)
  async listDemands(req, res, next) {
    try {
      const { cropName, district, status, page, limit } = req.query;
      const result = await demandService.listDemands({ cropName, district, status, page, limit });
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/demand/:id
  async getDemandById(req, res, next) {
    try {
      const demand = await demandService.getDemandById(req.params.id);
      if (!demand) {
        return res.status(404).json({ success: false, error: 'Demand not found' });
      }
      res.status(200).json({ success: true, demand });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/demand/:id
  async updateDemand(req, res, next) {
    try {
      const demand = await demandService.updateDemand(req.params.id, req.user.id, req.body);
      if (!demand) {
        return res.status(404).json({ success: false, error: 'Demand not found or you are not the owner' });
      }
      res.status(200).json({ success: true, demand });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/demand/:id
  async deleteDemand(req, res, next) {
    try {
      const demand = await demandService.deleteDemand(req.params.id, req.user.id);
      if (!demand) {
        return res.status(404).json({ success: false, error: 'Demand not found or you are not the owner' });
      }
      res.status(200).json({ success: true, message: 'Demand cancelled successfully', demand });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/demand/meta/crops
  async getDistinctCrops(req, res, next) {
    try {
      const crops = await demandService.getDistinctCrops();
      res.status(200).json({ success: true, crops });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/demand/meta/districts
  async getDistinctDistricts(req, res, next) {
    try {
      const districts = await demandService.getDistinctDistricts();
      res.status(200).json({ success: true, districts });
    } catch (err) {
      next(err);
    }
  },
};

export default demandController;
