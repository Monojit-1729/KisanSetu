import recommendationService from './recommendation.service.js';

export class RecommendationController {
  /**
   * GET /api/recommendations/lot/:lotId
   * Retrieve intelligent ranked dispatch/sale recommendations for a specific lot.
   */
  async getLotRecommendations(req, res, next) {
    try {
      const { lotId } = req.params;
      const { id: userId, role: userRole } = req.user;

      const recommendations = await recommendationService.getLotRecommendations(lotId, userId, userRole);

      return res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      return next(error);
    }
  }
}

export default new RecommendationController();
