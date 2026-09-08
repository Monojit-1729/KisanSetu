import apiClient from './client.js';

export const matchingApi = {
  // Get matching farmer/FPO lots for a specific buyer demand
  async getMatchesForDemand(demandId) {
    const res = await apiClient.get(`/matching/buyer/${demandId}`);
    return res.data;
  },

  // Get matching buyer demands for a specific farmer/FPO lot (Read-Only)
  async getMatchesForLot(lotId) {
    const res = await apiClient.get(`/matching/lot/${lotId}`);
    return res.data;
  },

  // Get summary of matching buyers for all owned active lots (Farmer/FPO)
  async getMyLotsMatchSummary() {
    const res = await apiClient.get('/matching/my-lots-summary');
    return res.data;
  },
};

export default matchingApi;
