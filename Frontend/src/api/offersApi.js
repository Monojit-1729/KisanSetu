import apiClient from './client.js';

export const offersApi = {
  // Create binding commercial offer on a produce lot (Buyer only)
  async createOffer(payload) {
    const res = await apiClient.post('/offers', payload);
    return res.data;
  },

  // Get current user's sent or received offers
  async getMyOffers(params = {}) {
    const res = await apiClient.get('/offers/my', { params });
    return res.data;
  },

  // Get offers submitted on a specific lot (Lot owner only)
  async getOffersForLot(lotId) {
    const res = await apiClient.get(`/offers/lot/${lotId}`);
    return res.data;
  },

  // Get single offer details
  async getOfferById(id) {
    const res = await apiClient.get(`/offers/${id}`);
    return res.data;
  },

  // Respond to offer (accept, reject, counter, withdraw)
  async respondToOffer(id, payload) {
    const res = await apiClient.patch(`/offers/${id}/respond`, payload);
    return res.data;
  },
};

export default offersApi;
