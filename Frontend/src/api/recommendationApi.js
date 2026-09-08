import apiClient from './client.js';

export const recommendationApi = {
  /**
   * Fetch explainable, ranked sales recommendations for a specific lot.
   * @param {string} lotId
   * @returns {Promise<Object>} Recommendation data including lotSummary, marketBenchmark, rankedOpportunities, recommendedTopOption
   */
  async getForLot(lotId) {
    const res = await apiClient.get(`/recommendations/lot/${lotId}`);
    return res.data?.data || res.data;
  },

  /**
   * Run a standalone net realization scenario calculation.
   * @param {Object} params
   * @returns {Promise<Object>} Net realization estimate breakdown
   */
  async calculateRealization(params) {
    const res = await apiClient.post('/realization/estimate', params);
    return res.data?.data || res.data;
  },
};

export default recommendationApi;
