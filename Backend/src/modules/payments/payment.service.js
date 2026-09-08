import { Payment } from './payment.model.js';
import { Order } from '../orders/order.model.js';

const ALLOWED_PAYMENT_TRANSITIONS = {
  pending: ['processing', 'failed'],
  processing: ['completed', 'failed'],
  completed: ['refunded'],
  failed: ['pending', 'processing'],
  refunded: [],
};

export const paymentService = {
  /**
   * Create or idempotently retrieve payment tracking record for an Order.
   */
  async createForOrder(orderInput, userId, customData = {}) {
    const orderId = orderInput?._id || orderInput?.id || orderInput;
    const order = await Order.findById(orderId);

    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    const existing = await Payment.findOne({ order: order._id });
    if (existing) {
      return existing;
    }

    const paymentId = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const payment = new Payment({
      paymentId,
      order: order._id,
      amount: order.totalValue,
      currency: 'INR',
      status: 'pending',
      methodPlaceholder: customData.methodPlaceholder || 'Direct Bank Transfer / Escrow Hold (Simulated)',
      transactionRefPlaceholder: customData.transactionRefPlaceholder || `TXN-SIM-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: customData.notes || 'Awaiting buyer simulated payment authorization.',
      timeline: [
        {
          status: 'pending',
          updatedBy: userId || order.buyer,
          note: `Payment ledger initialized for agreed amount ₹${order.totalValue?.toLocaleString('en-IN')}`,
          timestamp: new Date(),
        },
      ],
    });

    await payment.save();

    // Link back to Order
    order.payment = payment._id;
    await order.save();

    return payment;
  },

  /**
   * Retrieve payment status for an Order with participant access control.
   */
  async getByOrderId(orderParam, userId, userRole) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(orderParam);
    const orderQuery = isObjectId ? { $or: [{ _id: orderParam }, { orderId: orderParam }] } : { orderId: orderParam };

    const order = await Order.findOne(orderQuery);
    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    const buyerIdStr = order.buyer?.toString();
    const sellerIdStr = order.seller?.toString();
    const currentUserIdStr = userId?.toString();

    if (userRole !== 'admin' && buyerIdStr !== currentUserIdStr && sellerIdStr !== currentUserIdStr) {
      const err = new Error('Unauthorized to view payment details for this order');
      err.statusCode = 403;
      throw err;
    }

    let payment = await Payment.findOne({ order: order._id });

    // Gracefully auto-create default payment record if missing for an existing order
    if (!payment) {
      try {
        payment = await this.createForOrder(order, userId);
      } catch (err) {
        console.error('[PaymentService] Warning creating fallback payment:', err.message);
      }
    }

    return payment;
  },

  /**
   * Update payment milestone status with state transition validation.
   */
  async updateStatus(paymentIdParam, userId, userRole, updateData = {}) {
    const newStatus = updateData.status || updateData.newStatus;
    const note = updateData.note || '';
    const transactionRef = updateData.transactionRef || updateData.transactionRefPlaceholder || '';
    const method = updateData.method || updateData.methodPlaceholder || '';

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(paymentIdParam);
    const query = isObjectId
      ? { $or: [{ _id: paymentIdParam }, { paymentId: paymentIdParam }] }
      : { paymentId: paymentIdParam };

    const payment = await Payment.findOne(query).populate('order');
    if (!payment) {
      const err = new Error('Payment record not found');
      err.statusCode = 404;
      throw err;
    }

    const order = payment.order;
    const buyerIdStr = order?.buyer?.toString();
    const sellerIdStr = order?.seller?.toString();
    const currentUserIdStr = userId?.toString();

    if (userRole !== 'admin' && buyerIdStr !== currentUserIdStr && sellerIdStr !== currentUserIdStr) {
      const err = new Error('Unauthorized to update payment status for this order');
      err.statusCode = 403;
      throw err;
    }

    const currentStatus = payment.status;
    const allowed = ALLOWED_PAYMENT_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      const err = new Error(
        `Invalid payment status transition from '${currentStatus}' to '${newStatus}'. Allowed: ${
          allowed.join(', ') || 'none'
        }`
      );
      err.statusCode = 400;
      throw err;
    }

    payment.status = newStatus;
    if (method) {
      payment.methodPlaceholder = method;
    }
    if (transactionRef) {
      payment.transactionRefPlaceholder = transactionRef;
    }
    if (newStatus === 'completed') {
      payment.paidAt = new Date();
    }

    payment.timeline.push({
      status: newStatus,
      updatedBy: userId,
      note: note || `Payment status advanced to ${newStatus}`,
      timestamp: new Date(),
    });

    await payment.save();

    // Optionally synchronize Order timeline
    if (order) {
      try {
        const orderDoc = await Order.findById(order._id);
        if (orderDoc) {
          if (newStatus === 'completed') {
            orderDoc.paymentStatusPlaceholder = 'Payment Completed (Simulated Settlement)';
            if (orderDoc.orderStatus === 'delivered') {
              orderDoc.orderStatus = 'payment_completed';
              orderDoc.timeline.push({
                status: 'payment_completed',
                updatedBy: userId,
                note: 'Simulated payment settlement released to seller.',
                timestamp: new Date(),
              });
              await orderDoc.save();
            }
          } else if (newStatus === 'processing') {
            orderDoc.paymentStatusPlaceholder = 'Payment Processing / Escrow Hold';
          }
          await orderDoc.save();
        }
      } catch (e) {
        console.error('[PaymentService] Warning harmonizing order timeline:', e.message);
      }
    }

    return payment;
  },
};

export default paymentService;
