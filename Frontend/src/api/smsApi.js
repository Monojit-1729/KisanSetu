import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const smsApi = {
  /**
   * Simulate sending an SMS message.
   * @param {Object} payload - { phone, message }
   */
  simulateSms: async ({ phone, message }) => {
    const res = await api.post('/sms/simulate', { phone, message });
    return res.data;
  },

  /**
   * Retrieve conversation history for a given phone number.
   * @param {string} phone
   */
  getSmsHistory: async (phone) => {
    const res = await api.get('/sms/history', { params: { phone } });
    return res.data?.history || [];
  },

  /**
   * Retrieve registered demo phone numbers.
   */
  getDemoPhones: async () => {
    const res = await api.get('/sms/demo-phones');
    return res.data?.demoFarmers || [];
  },
};

export default smsApi;
