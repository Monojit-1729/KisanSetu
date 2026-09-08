import BuyerProfile, { BUYER_TYPES } from './buyer.model.js';

class BuyerService {
  calculateCompletion(data) {
    let score = 0;
    const totalWeights = 5;

    // 1. Business Name
    if (data.businessName && data.businessName.trim()) {
      score += 1;
    }

    // 2. Buyer Type
    if (data.buyerType && BUYER_TYPES.includes(data.buyerType)) {
      score += 1;
    }

    // 3. District location
    if (data.location?.district && data.location.district.trim()) {
      score += 1;
    }

    // 4. Interested crops
    if (Array.isArray(data.interestedCrops) && data.interestedCrops.length > 0) {
      score += 1;
    }

    // 5. Contact person or phone
    if (
      (data.contactInfo?.contactPerson && data.contactInfo.contactPerson.trim()) ||
      (data.contactInfo?.contactPhone && data.contactInfo.contactPhone.trim())
    ) {
      score += 1;
    }

    return Math.round((score / totalWeights) * 100);
  }

  async getProfileByUserId(userId) {
    return await BuyerProfile.findOne({ user: userId }).populate('user', 'name email phone role isVerified');
  }

  async upsertProfile(userId, updateData, userDefaults = {}) {
    let profile = await BuyerProfile.findOne({ user: userId });

    const mergedData = {
      businessName: updateData.businessName || profile?.businessName || userDefaults.name || '',
      buyerType: updateData.buyerType || profile?.buyerType || 'wholesaler',
      location: {
        state: updateData.location?.state || profile?.location?.state || 'Maharashtra',
        district: updateData.location?.district ?? profile?.location?.district ?? '',
        facilityAddress: updateData.location?.facilityAddress ?? profile?.location?.facilityAddress ?? '',
        pincode: updateData.location?.pincode ?? profile?.location?.pincode ?? '',
      },
      contactInfo: {
        contactPerson: updateData.contactInfo?.contactPerson ?? profile?.contactInfo?.contactPerson ?? userDefaults.name ?? '',
        contactPhone: updateData.contactInfo?.contactPhone ?? profile?.contactInfo?.contactPhone ?? userDefaults.phone ?? '',
        contactEmail: updateData.contactInfo?.contactEmail ?? profile?.contactInfo?.contactEmail ?? userDefaults.email ?? '',
      },
      interestedCrops: Array.isArray(updateData.interestedCrops)
        ? updateData.interestedCrops
        : profile?.interestedCrops || [],
      description: updateData.description ?? profile?.description ?? '',
      isVerified: profile?.isVerified || false,
    };

    mergedData.completionPercentage = this.calculateCompletion(mergedData);

    if (!profile) {
      profile = await BuyerProfile.create({
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

export default new BuyerService();
