import apiClient from './client.js';

export const authApi = {
  /**
   * Register a new user account
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Authenticate user with credentials
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Fetch current authenticated user profile
   */
  async getCurrentUser() {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * Invalidate session / log out
   */
  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export default authApi;
