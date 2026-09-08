import apiClient from './client.js';

export const lotsApi = {
  // Browse active lots (all authenticated roles)
  async listActive({ cropName, district, quality, page, limit } = {}) {
    const params = {};
    if (cropName) params.cropName = cropName;
    if (district) params.district = district;
    if (quality) params.quality = quality;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const res = await apiClient.get('/lots', { params });
    return res.data;
  },

  // Get my lots (farmer/FPO)
  async getMyLots() {
    const res = await apiClient.get('/lots/mine');
    return res.data;
  },

  // Get my active lot count for dashboard widget
  async getMyStats() {
    const res = await apiClient.get('/lots/stats');
    return res.data;
  },

  // Get single lot detail
  async getLotById(id) {
    const res = await apiClient.get(`/lots/${id}`);
    return res.data;
  },

  // Create a lot
  async createLot(data) {
    const res = await apiClient.post('/lots', data);
    return res.data;
  },

  // Update a lot (owner only)
  async updateLot(id, data) {
    const res = await apiClient.patch(`/lots/${id}`, data);
    return res.data;
  },

  // Close a lot (owner only)
  async closeLot(id) {
    const res = await apiClient.post(`/lots/${id}/close`);
    return res.data;
  },

  // Metadata helpers for filter dropdowns
  async getDistinctCrops() {
    const res = await apiClient.get('/lots/meta/crops');
    return res.data;
  },

  async getDistinctDistricts() {
    const res = await apiClient.get('/lots/meta/districts');
    return res.data;
  },
};

export default lotsApi;
