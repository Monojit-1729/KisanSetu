import apiClient from './client.js';

export const paymentsApi = {
  // Get payment status for an order
  async getByOrderId(orderId) {
    const res = await apiClient.get(`/payments/order/${orderId}`);
    return res.data;
  },

  // Initialize payment record
  async createPayment(payload) {
    const res = await apiClient.post('/payments', payload);
    return res.data;
  },

  // Update payment status
  async updateStatus(id, payload) {
    const res = await apiClient.patch(`/payments/${id}/status`, payload);
    return res.data;
  },
};

export default paymentsApi;
