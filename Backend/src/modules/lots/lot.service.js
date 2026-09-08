import Lot from './lot.model.js';

const DEFAULT_PAGE_SIZE = 20;

const lotService = {
  /**
   * Create a new produce lot for a farmer or FPO.
   */
  async createLot(userId, ownerRole, data) {
    const lot = new Lot({
      owner: userId,
      ownerRole,
      cropName: data.cropName,
      variety: data.variety || '',
      quantity: data.quantity,
      unit: data.unit || 'quintal',
      pricePerQuintal: data.pricePerQuintal,
      quality: data.quality || 'B',
      qualityStatus: data.qualityStatus || 'declared',
      qualityNotes: data.qualityNotes || '',
      qualityRef: data.qualityRef || '',
      harvestDate: data.harvestDate ? new Date(data.harvestDate) : undefined,
      availableFrom: data.availableFrom ? new Date(data.availableFrom) : new Date(),
      location: {
        state: data.location?.state || 'Maharashtra',
        district: data.location?.district || '',
        taluka: data.location?.taluka || '',
        village: data.location?.village || '',
        pincode: data.location?.pincode || '',
      },
      status: data.status === 'active' ? 'active' : 'draft',
      description: data.description || '',
    });

    await lot.save();
    return lot.toJSON();
  },

  /**
   * Retrieve all lots belonging to a specific user.
   */
  async getMyLots(userId) {
    const lots = await Lot.find({ owner: userId })
      .sort({ createdAt: -1 })
      .lean();
    return lots.map((l) => {
      const obj = new Lot(l).toJSON();
      return obj;
    });
  },

  /**
   * Retrieve a single lot by its ID, populating the owner's username.
   */
  async getLotById(id) {
    const lot = await Lot.findById(id).populate('owner', 'name email role').lean();
    if (!lot) return null;
    return {
      ...lot,
      id: lot._id.toString(),
      _id: undefined,
      __v: undefined,
      owner: lot.owner
        ? {
            id: lot.owner._id.toString(),
            name: lot.owner.name,
            email: lot.owner.email,
            role: lot.owner.role,
          }
        : null,
    };
  },

  /**
   * List active lots with optional filters and pagination.
   * @param {Object} filters - { cropName, district, quality, page, limit }
   */
  async listActiveLots({ cropName, district, quality, page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
    const query = { status: 'active' };
    if (cropName) query.cropName = { $regex: cropName, $options: 'i' };
    if (district) query['location.district'] = { $regex: district, $options: 'i' };
    if (quality) query.quality = quality;

    const skip = (Math.max(1, page) - 1) * limit;
    const [lots, total] = await Promise.all([
      Lot.find(query)
        .populate('owner', 'name role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Lot.countDocuments(query),
    ]);

    const items = lots.map((l) => ({
      ...l,
      id: l._id.toString(),
      _id: undefined,
      __v: undefined,
      owner: l.owner
        ? { id: l.owner._id.toString(), name: l.owner.name, role: l.owner.role }
        : null,
    }));

    return {
      items,
      total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(total / limit),
    };
  },

  /**
   * Update a lot — only if the requesting user is the owner.
   */
  async updateLot(id, userId, data) {
    const lot = await Lot.findOne({ _id: id, owner: userId });
    if (!lot) return null;

    const allowed = [
      'variety', 'quantity', 'unit', 'pricePerQuintal',
      'quality', 'qualityStatus', 'qualityNotes', 'qualityRef',
      'harvestDate', 'availableFrom', 'location', 'status', 'description',
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        if (key === 'location') {
          lot.location = { ...lot.location.toObject(), ...data.location };
        } else {
          lot[key] = data[key];
        }
      }
    }

    await lot.save();
    return lot.toJSON();
  },

  /**
   * Close a lot — only the owner can close it.
   */
  async closeLot(id, userId) {
    const lot = await Lot.findOne({ _id: id, owner: userId });
    if (!lot) return null;
    lot.status = 'closed';
    await lot.save();
    return lot.toJSON();
  },

  /**
   * Count active lots for a user (for dashboard widget).
   */
  async countMyActiveLots(userId) {
    return Lot.countDocuments({ owner: userId, status: 'active' });
  },

  /**
   * Get distinct crop names that have active lots.
   */
  async getDistinctCrops() {
    return Lot.distinct('cropName', { status: 'active' });
  },

  /**
   * Get distinct districts that have active lots.
   */
  async getDistinctDistricts() {
    return Lot.distinct('location.district', { status: 'active' });
  },
};

export default lotService;
