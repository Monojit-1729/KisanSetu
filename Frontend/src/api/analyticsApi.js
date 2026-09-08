import apiClient from './client.js';

export const analyticsApi = {
  /**
   * Fetch historical price trends, statistical summary, and inline forecast
   * @param {Object} params
   * @param {string} params.cropName
   * @param {string} [params.district]
   * @param {string} [params.mandiName]
   * @param {number} [params.days=30]
   */
  async getPriceTrends({ cropName, district, mandiName, days = 30 } = {}) {
    const params = { cropName };
    if (district) params.district = district;
    if (mandiName) params.mandiName = mandiName;
    if (days) params.days = days;

    const res = await apiClient.get('/analytics/price-trends', { params });
    return res.data;
  },

  /**
   * Fetch multi-market comparison for a selected crop across Maharashtra
   * @param {Object} params
   * @param {string} params.cropName
   * @param {string} [params.primaryDistrict]
   */
  async getMarketComparison({ cropName, primaryDistrict } = {}) {
    const params = { cropName };
    if (primaryDistrict) params.primaryDistrict = primaryDistrict;

    const res = await apiClient.get('/analytics/compare', { params });
    return res.data;
  },

  /**
   * Dedicated short-horizon forecast endpoint
   * @param {Object} params
   * @param {string} params.cropName
   * @param {string} [params.district]
   * @param {string} [params.mandiName]
   */
  async getForecast({ cropName, district, mandiName } = {}) {
    const params = { cropName };
    if (district) params.district = district;
    if (mandiName) params.mandiName = mandiName;

    const res = await apiClient.get('/analytics/forecast', { params });
    return res.data;
  },
};

export default analyticsApi;
