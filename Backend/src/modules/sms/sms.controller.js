import smsService from './sms.service.js';

export const smsController = {
  /**
   * POST /api/sms/simulate
   * Simulates sending an SMS message from a keypad mobile phone.
   */
  async simulate(req, res, next) {
    try {
      const { phone, message } = req.body;

      if (!phone || typeof phone !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Phone number is required to simulate SMS.',
        });
      }

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'SMS text message is required.',
        });
      }

      const result = await smsService.processSms(phone, message);

      return res.status(200).json({
        success: result.success,
        response: result.response,
        parsedCommand: result.parsedCommand,
        farmer: result.farmer,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/sms/history?phone=...
   * Retrieve simulated SMS conversation thread for a given phone number.
   */
  async getHistory(req, res, next) {
    try {
      const { phone } = req.query;
      if (!phone) {
        return res.status(400).json({
          success: false,
          error: 'Phone number query parameter is required.',
        });
      }

      const history = await smsService.getHistory(phone);
      return res.status(200).json({
        success: true,
        history,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/sms/demo-phones
   * Retrieve registered demo phone numbers for quick selection in the simulator.
   */
  async getDemoPhones(req, res, next) {
    try {
      const demoFarmers = await smsService.getDemoFarmers();
      return res.status(200).json({
        success: true,
        demoFarmers,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default smsController;
