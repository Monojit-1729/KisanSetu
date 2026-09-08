import logisticsService from './logistics.service.js';

export const logisticsController = {
  // POST /api/logistics/estimate
  async estimate(req, res, next) {
    try {
      const estimate = logisticsService.estimateLogistics(req.body);
      res.status(200).json({
        success: true,
        estimate,
        data: estimate,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/logistics
  async createLogistics(req, res, next) {
    try {
      const { orderId, ...customData } = req.body;
      if (!orderId) {
        const err = new Error('orderId is required to initialize logistics');
        err.statusCode = 400;
        throw err;
      }
      const logistics = await logisticsService.createForOrder(orderId, req.user.id, customData);
      res.status(201).json({
        success: true,
        message: 'Logistics tracking initialized successfully',
        logistics,
        data: logistics,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/logistics/order/:orderId
  async getByOrderId(req, res, next) {
    try {
      const logistics = await logisticsService.getByOrderId(req.params.orderId, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        logistics,
        data: logistics,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/logistics/:id
  async updateLogistics(req, res, next) {
    try {
      const logistics = await logisticsService.updateLogistics(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );
      res.status(200).json({
        success: true,
        message: 'Logistics details updated successfully',
        logistics,
        data: logistics,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/logistics/:id/status
  async updateStatus(req, res, next) {
    try {
      const logistics = await logisticsService.updateStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Logistics status updated to ${req.body.status}`,
        logistics,
        data: logistics,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default logisticsController;
