import apiClient from './client.js';

export const adminApi = {
  async getOverview() {
    const response = await apiClient.get('/admin/overview');
    return response.data;
  },
};

export default adminApi;
