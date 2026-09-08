import apiClient from './client.js';

export const logisticsApi = {
  // Prototype logistics estimate query
  async estimate(payload) {
    const res = await apiClient.post('/logistics/estimate', payload);
    return res.data;
  },

  // Initialize logistics for an order
  async createLogistics(payload) {
    const res = await apiClient.post('/logistics', payload);
    return res.data;
  },

  // Get logistics details for an order
  async getByOrderId(orderId) {
    const res = await apiClient.get(`/logistics/order/${orderId}`);
    return res.data;
  },

  // Update logistics metadata
  async updateLogistics(id, payload) {
    const res = await apiClient.patch(`/logistics/${id}`, payload);
    return res.data;
  },

  // Update logistics milestone status
  async updateStatus(id, payload) {
    const res = await apiClient.patch(`/logistics/${id}/status`, payload);
    return res.data;
  },
};

export default logisticsApi;
