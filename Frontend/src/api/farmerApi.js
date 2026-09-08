import apiClient from './client.js';

export const farmerApi = {
  async getProfile() {
    const response = await apiClient.get('/farmers/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.patch('/farmers/profile', profileData);
    return response.data;
  },

  async createProfile(profileData) {
    const response = await apiClient.post('/farmers/profile', profileData);
    return response.data;
  },
};

export default farmerApi;
