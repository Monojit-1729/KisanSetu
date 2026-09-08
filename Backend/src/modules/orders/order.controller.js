import orderService from './order.service.js';
import offerService from '../offers/offer.service.js';

export const orderController = {
  // POST /api/orders/from-offer/:offerId
  async createFromOffer(req, res, next) {
    try {
      const offer = await offerService.getOfferById(req.params.offerId, req.user.id, req.user.role);
      const order = await orderService.createOrderFromOffer(offer, req.user.id);
      res.status(200).json({
        success: true,
        message: 'Order created or retrieved successfully from accepted offer',
        order,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders/my
  async getMyOrders(req, res, next) {
    try {
      const orders = await orderService.getMyOrders(req.user.id, req.user.role, req.query);
      res.status(200).json({
        success: true,
        orders,
        data: orders,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders/:id
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
      res.status(200).json({
        success: true,
        order,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /api/orders/:id/status
  async updateOrderStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        req.body
      );
      res.status(200).json({
        success: true,
        message: `Order status updated to ${req.body.newStatus}`,
        order,
        data: order,
      });
    } catch (err) {
      next(err);
    }
  },
};

export default orderController;
