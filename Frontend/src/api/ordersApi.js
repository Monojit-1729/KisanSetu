import apiClient from './client.js';

export const ordersApi = {
  // Create order from accepted offer
  async createOrderFromOffer(offerId) {
    const res = await apiClient.post(`/orders/from-offer/${offerId}`);
    return res.data;
  },

  // Get current user's purchase or sale orders
  async getMyOrders(params = {}) {
    const res = await apiClient.get('/orders/my', { params });
    return res.data;
  },

  // Get single order details
  async getOrderById(id) {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data;
  },

  // Update order status timeline
  async updateOrderStatus(id, payload) {
    const res = await apiClient.patch(`/orders/${id}/status`, payload);
    return res.data;
  },
};

export default ordersApi;
