import analyticsService from './analytics.service.js';

export const analyticsController = {
  /**
   * GET /api/analytics/price-trends
   * Query params: cropName, district, mandiName, days
   */
  async getPriceTrends(req, res, next) {
    try {
      const { cropName, district, mandiName, days } = req.query;
      const data = await analyticsService.getPriceTrends({
        cropName,
        district,
        mandiName,
        days,
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/analytics/compare
   * Query params: cropName, primaryDistrict
   */
  async getMarketComparison(req, res, next) {
    try {
      const { cropName, primaryDistrict } = req.query;
      const data = await analyticsService.getMarketComparison({
        cropName,
        primaryDistrict,
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/analytics/forecast
   * Query params: cropName, district, mandiName
   */
  async getForecast(req, res, next) {
    try {
      const { cropName, district, mandiName } = req.query;
      const data = await analyticsService.getForecast({
        cropName,
        district,
        mandiName,
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default analyticsController;
