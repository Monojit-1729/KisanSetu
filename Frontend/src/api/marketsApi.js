import apiClient from './client.js';

export const marketsApi = {
  // Time-series prices for a crop in a district
  async getPrices({ cropName, district, days = 30 } = {}) {
    const params = {};
    if (cropName) params.cropName = cropName;
    if (district) params.district = district;
    if (days) params.days = days;
    const res = await apiClient.get('/markets/prices', { params });
    return res.data;
  },

  // Latest price per crop in a district (for market intelligence table)
  async getLatestByDistrict(district) {
    const res = await apiClient.get('/markets/latest', { params: { district } });
    return res.data;
  },

  // Single crop latest price (for dashboard widget)
  async getCropPrice({ cropName, district } = {}) {
    const params = {};
    if (cropName) params.cropName = cropName;
    if (district) params.district = district;
    const res = await apiClient.get('/markets/crop-price', { params });
    return res.data;
  },

  // Distinct crop names
  async getDistinctCrops() {
    const res = await apiClient.get('/markets/crops');
    return res.data;
  },

  // Distinct districts
  async getDistinctDistricts() {
    const res = await apiClient.get('/markets/districts');
    return res.data;
  },
};

export default marketsApi;
