import MarketPrice from './marketPrice.model.js';

const DAYS_WINDOW = 30;

const marketService = {
  /**
   * Get time-series price data for a crop in a district (last N days).
   * @param {string} cropName
   * @param {string} district
   * @param {number} days - how many days of history
   */
  async getPrices(cropName, district, days = DAYS_WINDOW) {
    if (!cropName || !district) {
      throw Object.assign(new Error('cropName and district are required'), { statusCode: 400 });
    }
    const since = new Date();
    since.setDate(since.getDate() - days);

    const prices = await MarketPrice.find({
      cropName: { $regex: `^${cropName}$`, $options: 'i' },
      district: { $regex: `^${district}$`, $options: 'i' },
      arrivalDate: { $gte: since },
    })
      .sort({ arrivalDate: -1 })
      .lean();

    return prices.map((p) => ({
      ...p,
      id: p._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  },

  /**
   * Get the most recent price record per crop for a district.
   * Useful for dashboard "latest price" widgets.
   */
  async getLatestByDistrict(district) {
    if (!district) {
      throw Object.assign(new Error('district is required'), { statusCode: 400 });
    }

    const results = await MarketPrice.aggregate([
      {
        $match: {
          district: { $regex: `^${district}$`, $options: 'i' },
        },
      },
      { $sort: { arrivalDate: -1 } },
      {
        $group: {
          _id: '$cropName',
          cropName: { $first: '$cropName' },
          district: { $first: '$district' },
          mandiName: { $first: '$mandiName' },
          minPrice: { $first: '$minPrice' },
          maxPrice: { $first: '$maxPrice' },
          modalPrice: { $first: '$modalPrice' },
          arrivalDate: { $first: '$arrivalDate' },
          unit: { $first: '$unit' },
        },
      },
      { $sort: { cropName: 1 } },
    ]);

    return results.map((r) => ({ ...r, id: r._id.toString(), _id: undefined }));
  },

  /**
   * Get the latest price for a specific crop in any district closest to the given one.
   * Used for dashboard single-crop widget.
   */
  async getLatestPriceForCrop(cropName, district) {
    const record = await MarketPrice.findOne({
      cropName: { $regex: `^${cropName}$`, $options: 'i' },
      district: { $regex: `^${district}$`, $options: 'i' },
    })
      .sort({ arrivalDate: -1 })
      .lean();

    if (!record) return null;
    return {
      ...record,
      id: record._id.toString(),
      _id: undefined,
      __v: undefined,
    };
  },

  /**
   * Return a list of all distinct crop names present in the collection.
   */
  async getDistinctCrops() {
    return MarketPrice.distinct('cropName');
  },

  /**
   * Return a list of all distinct districts present in the collection.
   */
  async getDistinctDistricts() {
    return MarketPrice.distinct('district');
  },
};

export default marketService;
