import { Order } from './order.model.js';
import { Lot } from '../lots/index.js';
import logisticsService from '../logistics/logistics.service.js';
import paymentService from '../payments/payment.service.js';

const ALLOWED_TRANSITIONS = {
  confirmed: ['processing', 'ready_for_dispatch', 'logistics_scheduled', 'cancelled'],
  processing: ['ready_for_dispatch', 'logistics_scheduled', 'in_transit', 'cancelled'],
  ready_for_dispatch: ['logistics_scheduled', 'picked_up', 'in_transit', 'cancelled'],
  logistics_scheduled: ['picked_up', 'in_transit', 'cancelled'],
  picked_up: ['in_transit', 'delivered', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: ['payment_pending', 'payment_completed', 'completed'],
  payment_pending: ['payment_completed', 'completed'],
  payment_completed: ['completed'],
  completed: [],
  cancelled: [],
};

export const orderService = {
  /**
   * Create an Order atomically from an accepted offer.
   */
  async createOrderFromOffer(offer, requestingUserId) {
    if (!offer) {
      const err = new Error('Offer object is required to create order');
      err.statusCode = 400;
      throw err;
    }

    if (offer.status !== 'accepted') {
      const err = new Error('Cannot create order from an unaccepted offer');
      err.statusCode = 400;
      throw err;
    }

    // Idempotency check: prevent duplicate orders from the same offer
    const offerRef = offer._id || offer.id;
    const existingOrder = await Order.findOne({ acceptedOffer: offerRef });
    if (existingOrder) {
      return {
        ...existingOrder.toJSON(),
        status: existingOrder.orderStatus,
        totalAmount: existingOrder.totalValue,
        unitPrice: existingOrder.agreedPricePerUnit,
      };
    }

    const orderId = `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const buyerId = offer.buyer?._id || offer.buyer;
    const sellerId = offer.seller?._id || offer.seller;
    const lotId = offer.lot?._id || offer.lot;

    const lot = await Lot.findById(lotId);

    const order = new Order({
      orderId,
      lot: lotId,
      buyer: buyerId,
      seller: sellerId,
      acceptedOffer: offer._id,
      cropName: offer.cropName,
      grade: lot?.quality || 'B',
      variety: lot?.variety || '',
      qualityStatus: lot?.qualityStatus || 'declared',
      qualityNotes: lot?.qualityNotes || '',
      qualityRef: lot?.qualityRef || '',
      quantity: offer.quantity,
      unit: offer.unit || 'quintal',
      agreedPricePerUnit: offer.offeredPricePerUnit,
      totalValue: offer.totalOfferedValue,
      orderStatus: 'confirmed',
      timeline: [
        {
          status: 'confirmed',
          updatedBy: requestingUserId || sellerId,
          note: `Order confirmed via acceptance of commercial offer ${offer.offerId}.`,
          timestamp: new Date(),
        },
      ],
    });

    await order.save();

    // Auto-initialize operations records (Logistics & Payment)
    try {
      await logisticsService.createForOrder(order, requestingUserId);
    } catch (err) {
      console.error('[OrderService] Non-fatal warning auto-initializing logistics:', err.message);
    }

    try {
      await paymentService.createForOrder(order, requestingUserId);
    } catch (err) {
      console.error('[OrderService] Non-fatal warning auto-initializing payment:', err.message);
    }

    // Synchronize Produce Lot quantity/status
    try {
      if (lot) {
        if (lot.quantity <= offer.quantity) {
          lot.status = 'sold';
        } else {
          lot.quantity = Math.max(0, lot.quantity - offer.quantity);
        }
        await lot.save();
      }
    } catch (err) {
      console.error('[OrderService] Warning updating lot inventory status:', err.message);
    }

    return {
      ...order.toJSON(),
      status: order.orderStatus,
      totalAmount: order.totalValue,
      unitPrice: order.agreedPricePerUnit,
    };
  },

  /**
   * Get orders for the authenticated user (as buyer or seller).
   */
  async getMyOrders(userId, userRole, { status } = {}) {
    const query = {
      $or: [{ buyer: userId }, { seller: userId }],
    };

    if (status) {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role')
      .populate('lot', 'cropName variety quality location qualityStatus qualityNotes')
      .populate('acceptedOffer', 'offerId offeredPricePerUnit totalOfferedValue message')
      .populate('logistics')
      .populate('payment')
      .sort({ createdAt: -1 })
      .lean();

    return orders.map((o) => ({
      ...o,
      id: o._id.toString(),
      status: o.orderStatus,
      totalAmount: o.totalValue,
      unitPrice: o.agreedPricePerUnit,
    }));
  },

  /**
   * Get single order by ID with access control.
   */
  async getOrderById(orderId, userId, userRole) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
    const query = isObjectId ? { $or: [{ _id: orderId }, { orderId }] } : { orderId };

    const order = await Order.findOne(query)
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role')
      .populate('lot')
      .populate('acceptedOffer')
      .populate('logistics')
      .populate('payment')
      .lean();

    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    // Access authorization: buyer, seller, or admin only
    const buyerIdStr = order.buyer?._id?.toString() || order.buyer?.toString();
    const sellerIdStr = order.seller?._id?.toString() || order.seller?.toString();
    const currentUserIdStr = userId.toString();

    if (userRole !== 'admin' && buyerIdStr !== currentUserIdStr && sellerIdStr !== currentUserIdStr) {
      const err = new Error('Unauthorized to view this order');
      err.statusCode = 403;
      throw err;
    }

    return {
      ...order,
      id: order._id.toString(),
      status: order.orderStatus,
      totalAmount: order.totalValue,
      unitPrice: order.agreedPricePerUnit,
    };
  },

  /**
   * Update order status following the lifecycle timeline.
   */
  async updateOrderStatus(orderId, userId, userRole, payload = {}) {
    const newStatus = payload.newStatus || payload.status;
    const note = payload.note;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderId);
    const query = isObjectId ? { $or: [{ _id: orderId }, { orderId }] } : { orderId };

    const order = await Order.findOne(query);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    // Access authorization: participant or admin only
    const buyerIdStr = order.buyer.toString();
    const sellerIdStr = order.seller.toString();
    const currentUserIdStr = userId.toString();

    if (userRole !== 'admin' && buyerIdStr !== currentUserIdStr && sellerIdStr !== currentUserIdStr) {
      const err = new Error('Unauthorized to update this order');
      err.statusCode = 403;
      throw err;
    }

    const currentStatus = order.orderStatus;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      const err = new Error(
        `Invalid status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${allowed.join(', ') || 'none'}`
      );
      err.statusCode = 400;
      throw err;
    }

    order.orderStatus = newStatus;
    order.timeline.push({
      status: newStatus,
      updatedBy: userId,
      note: note || `Order status updated to ${newStatus}`,
      timestamp: new Date(),
    });

    await order.save();

    const updated = order.toJSON();
    return {
      ...updated,
      status: order.orderStatus,
      totalAmount: order.totalValue,
      unitPrice: order.agreedPricePerUnit,
    };
  },
};

export default orderService;
