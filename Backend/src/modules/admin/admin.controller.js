import { User } from '../users/index.js';
import { FarmerProfile } from '../farmers/index.js';
import { FpoProfile } from '../fpos/index.js';
import { BuyerProfile } from '../buyers/index.js';

class AdminController {
  async getOverview(req, res, next) {
    try {
      const [
        totalUsers,
        farmersCount,
        fposCount,
        buyersCount,
        adminCount,
        verifiedUsers,
        farmerProfilesCount,
        fpoProfilesCount,
        buyerProfilesCount,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'farmer' }),
        User.countDocuments({ role: 'fpo' }),
        User.countDocuments({ role: 'buyer' }),
        User.countDocuments({ role: 'admin' }),
        User.countDocuments({ isVerified: true }),
        FarmerProfile.countDocuments(),
        FpoProfile.countDocuments(),
        BuyerProfile.countDocuments(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          metrics: {
            totalUsers,
            farmers: farmersCount,
            fpos: fposCount,
            buyers: buyersCount,
            admins: adminCount,
            verifiedUsers,
            unverifiedUsers: totalUsers - verifiedUsers,
          },
          profiles: {
            farmerProfiles: farmerProfilesCount,
            fpoProfiles: fpoProfilesCount,
            buyerProfiles: buyerProfilesCount,
            totalProfiles: farmerProfilesCount + fpoProfilesCount + buyerProfilesCount,
          },
          systemStatus: {
            environment: process.env.NODE_ENV || 'development',
            database: 'connected',
            security: 'JWT + Role Enforcement Active',
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
