import marketService from './market.service.js';

const marketController = {
  // GET /api/markets/prices?cropName=&district=&days=
  async getPrices(req, res, next) {
    try {
      const { cropName, district, days } = req.query;
      const prices = await marketService.getPrices(cropName, district, days ? Number(days) : 30);
      res.status(200).json({ success: true, prices });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/markets/latest?district=
  async getLatestByDistrict(req, res, next) {
    try {
      const { district } = req.query;
      const prices = await marketService.getLatestByDistrict(district);
      res.status(200).json({ success: true, prices });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/markets/crop-price?cropName=&district=
  async getLatestPriceForCrop(req, res, next) {
    try {
      const { cropName, district } = req.query;
      const price = await marketService.getLatestPriceForCrop(cropName, district);
      res.status(200).json({ success: true, price });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/markets/crops
  async getDistinctCrops(req, res, next) {
    try {
      const crops = await marketService.getDistinctCrops();
      res.status(200).json({ success: true, crops });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/markets/districts
  async getDistinctDistricts(req, res, next) {
    try {
      const districts = await marketService.getDistinctDistricts();
      res.status(200).json({ success: true, districts });
    } catch (err) {
      next(err);
    }
  },
};

export default marketController;
