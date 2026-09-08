import buyerService from './buyer.service.js';

class BuyerController {
  async getMe(req, res, next) {
    try {
      const profile = await buyerService.getProfileByUserId(req.user.id);
      res.status(200).json({
        success: true,
        data: {
          profile,
          isProfileComplete: Boolean(profile && profile.completionPercentage >= 80),
          completionPercentage: profile?.completionPercentage || 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const profile = await buyerService.upsertProfile(req.user.id, req.body, {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
      });
      res.status(200).json({
        success: true,
        message: 'Buyer profile saved successfully',
        data: {
          profile,
          isProfileComplete: profile.completionPercentage >= 80,
          completionPercentage: profile.completionPercentage,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new BuyerController();
