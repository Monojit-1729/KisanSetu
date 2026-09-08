import paymentService from './payment.service.js';

export const paymentController = {
  // GET /api/payments/order/:orderId
  async getByOrderId(req, res, next) {
    try {
      const payment = await paymentService.getByOrderId(req.params.orderId, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        payment,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/payments
  async createPayment(req, res, next) {
    try {
      const { orderId, ...customData } = req.body;
      if (!orderId) {
        const err = new Error('orderId is required to initialize payment record');
        err.statusCode = 400;
        throw err;
      }
      const payment = await paymentService.createForOrder(orderId, req.user.id, customData);
      res.status(201).json({
        success: true,
        message: 'Payment tracking ledger initialized successfully',
        payment,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/payments/:id/status
  async updateStatus(req, res, next) {
    try {
      const payment = await paymentService.updateStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Payment status updated to ${req.body.status}`,
        payment,
        data: payment,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default paymentController;
