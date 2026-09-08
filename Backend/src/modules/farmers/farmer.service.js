import FarmerProfile from './farmer.model.js';

class FarmerService {
  /**
   * Calculates profile completion percentage (0 - 100).
   */
  calculateCompletion(data) {
    let score = 0;
    const totalWeights = 5;

    // 1. Full name / phone
    if ((data.fullName && data.fullName.trim()) || (data.phone && data.phone.trim())) {
      score += 1;
    }

    // 2. District location
    if (data.location?.district && data.location.district.trim()) {
      score += 1;
    }

    // 3. At least one crop interest
    if (Array.isArray(data.cropInterests) && data.cropInterests.length > 0) {
      score += 1;
    }

    // 4. Farm land information
    if (data.farmInfo?.totalLandAcres > 0) {
      score += 1;
    }

    // 5. Preferred language
    if (data.preferredLanguage) {
      score += 1;
    }

    return Math.round((score / totalWeights) * 100);
  }

  /**
   * Retrieves farmer profile by User ID.
   */
  async getProfileByUserId(userId) {
    let profile = await FarmerProfile.findOne({ user: userId }).populate('user', 'name email phone role isVerified');
    return profile;
  }

  /**
   * Upserts farmer profile for the authenticated user.
   */
  async upsertProfile(userId, updateData, userDefaults = {}) {
    let profile = await FarmerProfile.findOne({ user: userId });

    const mergedData = {
      fullName: updateData.fullName || profile?.fullName || userDefaults.name || '',
      phone: updateData.phone || profile?.phone || userDefaults.phone || '',
      location: {
        state: updateData.location?.state || profile?.location?.state || 'Maharashtra',
        district: updateData.location?.district ?? profile?.location?.district ?? '',
        taluka: updateData.location?.taluka ?? profile?.location?.taluka ?? '',
        village: updateData.location?.village ?? profile?.location?.village ?? '',
        pincode: updateData.location?.pincode ?? profile?.location?.pincode ?? '',
      },
      preferredLanguage: updateData.preferredLanguage || profile?.preferredLanguage || 'en',
      cropInterests: Array.isArray(updateData.cropInterests)
        ? updateData.cropInterests
        : profile?.cropInterests || [],
      farmInfo: {
        totalLandAcres:
          updateData.farmInfo?.totalLandAcres !== undefined
            ? Number(updateData.farmInfo.totalLandAcres)
            : profile?.farmInfo?.totalLandAcres || 0,
        soilType: updateData.farmInfo?.soilType ?? profile?.farmInfo?.soilType ?? '',
        irrigationSource: updateData.farmInfo?.irrigationSource ?? profile?.farmInfo?.irrigationSource ?? '',
      },
      fpoAffiliation: {
        isMember:
          updateData.fpoAffiliation?.isMember !== undefined
            ? Boolean(updateData.fpoAffiliation.isMember)
            : profile?.fpoAffiliation?.isMember || false,
        fpoName: updateData.fpoAffiliation?.fpoName ?? profile?.fpoAffiliation?.fpoName ?? '',
      },
    };

    mergedData.completionPercentage = this.calculateCompletion(mergedData);

    if (!profile) {
      profile = await FarmerProfile.create({
        user: userId,
        ...mergedData,
      });
    } else {
      Object.assign(profile, mergedData);
      await profile.save();
    }

    return await profile.populate('user', 'name email phone role isVerified');
  }
}

export default new FarmerService();
