import apiClient from './client.js';

export const buyerApi = {
  async getProfile() {
    const response = await apiClient.get('/buyers/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.patch('/buyers/profile', profileData);
    return response.data;
  },

  async createProfile(profileData) {
    const response = await apiClient.post('/buyers/profile', profileData);
    return response.data;
  },
};

export default buyerApi;
