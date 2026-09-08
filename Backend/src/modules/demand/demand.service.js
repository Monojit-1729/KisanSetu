import Demand from './demand.model.js';

const DEFAULT_PAGE_SIZE = 20;

const demandService = {
  /**
   * Create a new procurement demand for a verified Buyer.
   */
  async createDemand(buyerId, data) {
    const demand = new Demand({
      buyer: buyerId,
      cropName: data.cropName,
      variety: data.variety || '',
      quantity: Number(data.quantity),
      unit: data.unit || 'quintal',
      quality: data.quality || 'B',
      deliveryLocation: {
        state: data.deliveryLocation?.state || 'Maharashtra',
        district: data.deliveryLocation?.district || '',
        taluka: data.deliveryLocation?.taluka || '',
        village: data.deliveryLocation?.village || '',
        pincode: data.deliveryLocation?.pincode || '',
        deliveryAddress: data.deliveryLocation?.deliveryAddress || '',
      },
      deliveryWindow: {
        startDate: data.deliveryWindow?.startDate ? new Date(data.deliveryWindow.startDate) : new Date(),
        endDate: new Date(data.deliveryWindow?.endDate),
      },
      targetPrice: data.targetPrice ? Number(data.targetPrice) : undefined,
      status: data.status === 'active' || !data.status ? 'active' : data.status,
      description: data.description || '',
    });

    await demand.save();
    return demand.toJSON();
  },

  /**
   * Retrieve all demands created by a specific buyer.
   */
  async getMyDemands(buyerId, { status, page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
    const query = { buyer: buyerId };
    if (status) query.status = status;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || DEFAULT_PAGE_SIZE));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Demand.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Demand.countDocuments(query),
    ]);

    return {
      items: items.map((d) => ({
        ...d,
        id: d._id.toString(),
        _id: undefined,
        __v: undefined,
      })),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  },

  /**
   * Return buyer demand statistics (active count, total count) for dashboard widgets.
   */
  async getMyStats(buyerId) {
    const [activeCount, totalCount] = await Promise.all([
      Demand.countDocuments({ buyer: buyerId, status: 'active' }),
      Demand.countDocuments({ buyer: buyerId }),
    ]);
    return { activeCount, totalCount };
  },

  /**
   * List active demands with optional search/filter (for marketplace exploration).
   */
  async listDemands({ cropName, district, status = 'active', page = 1, limit = DEFAULT_PAGE_SIZE } = {}) {
    const query = {};
    if (status) query.status = status;
    if (cropName) query.cropName = new RegExp(`^${cropName.trim()}$`, 'i');
    if (district) query['deliveryLocation.district'] = new RegExp(`^${district.trim()}$`, 'i');

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(100, Number(limit) || DEFAULT_PAGE_SIZE));
    const skip = (pageNum - 1) * limitNum;

    const [items, total] = await Promise.all([
      Demand.find(query)
        .populate('buyer', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Demand.countDocuments(query),
    ]);

    return {
      items: items.map((d) => ({
        ...d,
        id: d._id.toString(),
        _id: undefined,
        __v: undefined,
        buyer: d.buyer
          ? {
              id: d.buyer._id.toString(),
              name: d.buyer.name,
              email: d.buyer.email,
            }
          : null,
      })),
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    };
  },

  /**
   * Retrieve a single demand by ID with populated buyer info.
   */
  async getDemandById(id) {
    const demand = await Demand.findById(id).populate('buyer', 'name email role').lean();
    if (!demand) return null;

    return {
      ...demand,
      id: demand._id.toString(),
      _id: undefined,
      __v: undefined,
      buyer: demand.buyer
        ? {
            id: demand.buyer._id.toString(),
            name: demand.buyer.name,
            email: demand.buyer.email,
          }
        : null,
    };
  },

  /**
   * Update a demand — strictly enforced: only the owning buyer can update.
   */
  async updateDemand(id, buyerId, data) {
    const demand = await Demand.findOne({ _id: id, buyer: buyerId });
    if (!demand) return null;

    const allowed = [
      'cropName',
      'variety',
      'quantity',
      'unit',
      'quality',
      'deliveryLocation',
      'deliveryWindow',
      'targetPrice',
      'status',
      'description',
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        if (key === 'deliveryLocation') {
          demand.deliveryLocation = { ...demand.deliveryLocation.toObject(), ...data.deliveryLocation };
        } else if (key === 'deliveryWindow') {
          if (data.deliveryWindow.startDate) demand.deliveryWindow.startDate = new Date(data.deliveryWindow.startDate);
          if (data.deliveryWindow.endDate) demand.deliveryWindow.endDate = new Date(data.deliveryWindow.endDate);
        } else {
          demand[key] = data[key];
        }
      }
    }

    await demand.save();
    return demand.toJSON();
  },

  /**
   * Cancel or delete a demand — strictly enforced: only the owning buyer can cancel/delete.
   */
  async deleteDemand(id, buyerId) {
    const demand = await Demand.findOne({ _id: id, buyer: buyerId });
    if (!demand) return null;

    // Mark cancelled for historical integrity
    demand.status = 'cancelled';
    await demand.save();
    return demand.toJSON();
  },

  /**
   * Get distinct crop names that have active demands.
   */
  async getDistinctCrops() {
    return Demand.distinct('cropName', { status: 'active' });
  },

  /**
   * Get distinct delivery districts that have active demands.
   */
  async getDistinctDistricts() {
    return Demand.distinct('deliveryLocation.district', { status: 'active' });
  },
};

export default demandService;
