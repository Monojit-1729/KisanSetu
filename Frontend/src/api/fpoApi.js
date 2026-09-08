import apiClient from './client.js';

export const fpoApi = {
  async getProfile() {
    const response = await apiClient.get('/fpos/me');
    return response.data;
  },

  async updateProfile(profileData) {
    const response = await apiClient.patch('/fpos/profile', profileData);
    return response.data;
  },

  async createProfile(profileData) {
    const response = await apiClient.post('/fpos/profile', profileData);
    return response.data;
  },
};

export default fpoApi;
