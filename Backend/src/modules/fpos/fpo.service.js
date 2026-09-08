import FpoProfile from './fpo.model.js';

class FpoService {
  calculateCompletion(data) {
    let score = 0;
    const totalWeights = 5;

    // 1. FPO Name
    if (data.fpoName && data.fpoName.trim()) {
      score += 1;
    }

    // 2. Registration number
    if (data.registrationNumber && data.registrationNumber.trim()) {
      score += 1;
    }

    // 3. District location
    if (data.location?.district && data.location.district.trim()) {
      score += 1;
    }

    // 4. Major crops
    if (Array.isArray(data.majorCrops) && data.majorCrops.length > 0) {
      score += 1;
    }

    // 5. Member count > 0
    if (data.memberCount && Number(data.memberCount) > 0) {
      score += 1;
    }

    return Math.round((score / totalWeights) * 100);
  }

  async getProfileByUserId(userId) {
    return await FpoProfile.findOne({ user: userId }).populate('user', 'name email phone role isVerified');
  }

  async upsertProfile(userId, updateData, userDefaults = {}) {
    let profile = await FpoProfile.findOne({ user: userId });

    const mergedData = {
      fpoName: updateData.fpoName || profile?.fpoName || userDefaults.name || '',
      registrationNumber: updateData.registrationNumber ?? profile?.registrationNumber ?? '',
      location: {
        state: updateData.location?.state || profile?.location?.state || 'Maharashtra',
        district: updateData.location?.district ?? profile?.location?.district ?? '',
        officeAddress: updateData.location?.officeAddress ?? profile?.location?.officeAddress ?? '',
        pincode: updateData.location?.pincode ?? profile?.location?.pincode ?? '',
      },
      contactInfo: {
        contactPerson: updateData.contactInfo?.contactPerson ?? profile?.contactInfo?.contactPerson ?? userDefaults.name ?? '',
        contactPhone: updateData.contactInfo?.contactPhone ?? profile?.contactInfo?.contactPhone ?? userDefaults.phone ?? '',
        contactEmail: updateData.contactInfo?.contactEmail ?? profile?.contactInfo?.contactEmail ?? userDefaults.email ?? '',
      },
      memberCount:
        updateData.memberCount !== undefined
          ? Number(updateData.memberCount)
          : profile?.memberCount || 0,
      majorCrops: Array.isArray(updateData.majorCrops)
        ? updateData.majorCrops
        : profile?.majorCrops || [],
      description: updateData.description ?? profile?.description ?? '',
      isVerified: profile?.isVerified || false,
    };

    mergedData.completionPercentage = this.calculateCompletion(mergedData);

    if (!profile) {
      profile = await FpoProfile.create({
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

export default new FpoService();
