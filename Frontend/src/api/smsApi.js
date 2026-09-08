import apiClient from './client.js';

export const smsApi = {
  /**
   * Simulate sending an SMS message.
   * @param {Object} payload - { phone, message }
   */
  simulateSms: async ({ phone, message }) => {
    const res = await apiClient.post('/sms/simulate', { phone, message });
    return res.data;
  },

  /**
   * Retrieve conversation history for a given phone number.
   * @param {string} phone
   */
  getSmsHistory: async (phone) => {
    const res = await apiClient.get('/sms/history', { params: { phone } });
    return res.data?.history || [];
  },

  /**
   * Retrieve registered demo phone numbers.
   */
  getDemoPhones: async () => {
    const res = await apiClient.get('/sms/demo-phones');
    return res.data?.demoFarmers || [];
  },
};

export default smsApi;
