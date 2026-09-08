import apiClient from './client.js';

export const demandApi = {
  // Create a new procurement demand (Buyer only)
  async createDemand(data) {
    const res = await apiClient.post('/demand', data);
    return res.data;
  },

  // Get current authenticated buyer's demands
  async getMyDemands({ status, page, limit } = {}) {
    const params = {};
    if (status) params.status = status;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const res = await apiClient.get('/demand/my', { params });
    return res.data;
  },

  // Get current authenticated buyer's demand statistics
  async getMyStats() {
    const res = await apiClient.get('/demand/stats');
    return res.data;
  },

  // List/browse all active demands
  async listDemands({ cropName, district, status, page, limit } = {}) {
    const params = {};
    if (cropName) params.cropName = cropName;
    if (district) params.district = district;
    if (status) params.status = status;
    if (page) params.page = page;
    if (limit) params.limit = limit;
    const res = await apiClient.get('/demand', { params });
    return res.data;
  },

  // Get a single demand by ID
  async getDemandById(id) {
    const res = await apiClient.get(`/demand/${id}`);
    return res.data;
  },

  // Update a demand (owner only)
  async updateDemand(id, data) {
    const res = await apiClient.patch(`/demand/${id}`, data);
    return res.data;
  },

  // Cancel/delete a demand (owner only)
  async deleteDemand(id) {
    const res = await apiClient.delete(`/demand/${id}`);
    return res.data;
  },

  // Metadata dropdown helpers
  async getDistinctCrops() {
    const res = await apiClient.get('/demand/meta/crops');
    return res.data;
  },

  async getDistinctDistricts() {
    const res = await apiClient.get('/demand/meta/districts');
    return res.data;
  },
};

export default demandApi;
