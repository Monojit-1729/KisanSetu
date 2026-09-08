import { Logistics } from './logistics.model.js';
import { Order } from '../orders/order.model.js';
import realizationService from '../realization/realization.service.js';

const ALLOWED_LOGISTICS_TRANSITIONS = {
  pending: ['scheduled', 'cancelled'],
  scheduled: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'delivered', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const logisticsService = {
  /**
   * Deterministic prototype estimate for transport distance and freight cost.
   * Directly reuses A4 net-realization freight tariff formula and distance table.
   */
  estimateLogistics({ quantity = 10, unit = 'quintal', origin = {}, destination = {} }) {
    const qty = Number(quantity) || 1;
    const distanceKm = realizationService.getDistanceKm(
      origin.district,
      destination.district,
      origin.state,
      destination.state
    );

    // Tariff Benchmark: ₹15/q loading + ₹0.40/q/km transit rate
    const baseLoading = Number((15 * qty).toFixed(2));
    const transitFreight = Number((0.4 * distanceKm * qty).toFixed(2));
    const estimatedCost = Number((baseLoading + transitFreight).toFixed(2));

    let vehicleType = 'Small Pickup Truck (Bolero/Tata Ace)';
    let capacityQuintals = 25;

    if (qty > 90) {
      vehicleType = 'Heavy Multi-Axle Truck (16T+)';
      capacityQuintals = 200;
    } else if (qty > 25) {
      vehicleType = 'Medium 6-Wheeler Hauler (Eicher)';
      capacityQuintals = 90;
    }

    return {
      distanceKm,
      estimatedCost,
      vehicleType,
      recommendedVehicle: vehicleType,
      capacityQuintals,
      tariffBreakdown: {
        baseLoading,
        transitFreight,
        ratePerKmPerQuintal: 0.4,
        loadingRatePerQuintal: 15,
      },
      disclaimer: 'Estimated transport cost for prototype demonstration based on inter-district benchmark tariffs.',
    };
  },

  /**
   * Create or idempotently retrieve a logistics record for an existing Order.
   */
  async createForOrder(orderInput, userId, customData = {}) {
    const orderId = orderInput?._id || orderInput?.id || orderInput;
    const order = await Order.findById(orderId).populate('lot').populate('acceptedOffer');

    if (!order) {
      const err = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    // Check if logistics record already exists
    const existing = await Logistics.findOne({ order: order._id });
    if (existing) {
      return existing;
    }

    const lotLocation = order.lot?.location || {};
    const offerDelivery = order.acceptedOffer?.deliveryLocation || {};

    const origin = {
      state: customData.origin?.state || lotLocation.state || 'Maharashtra',
      district: customData.origin?.district || lotLocation.district || 'Nashik',
      taluka: customData.origin?.taluka || lotLocation.taluka || '',
      village: customData.origin?.village || lotLocation.village || '',
      address: customData.origin?.address || lotLocation.village || 'Farm-gate',
    };

    const destination = {
      state: customData.destination?.state || offerDelivery.state || 'Maharashtra',
      district: customData.destination?.district || offerDelivery.district || 'Pune',
      address: customData.destination?.address || offerDelivery.address || 'Market Yard / Warehouse Hub',
    };

    const estimate = this.estimateLogistics({
      quantity: order.quantity,
      unit: order.unit,
      origin,
      destination,
    });

    const logisticsId = `LOG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const pickupDate = customData.pickupDate ? new Date(customData.pickupDate) : new Date(Date.now() + 86400000);
    const expectedDeliveryDate = customData.expectedDeliveryDate
      ? new Date(customData.expectedDeliveryDate)
      : new Date(Date.now() + 3 * 86400000);

    const logistics = new Logistics({
      logisticsId,
      order: order._id,
      origin,
      destination,
      distanceKm: estimate.distanceKm,
      vehicleType: customData.vehicleType || estimate.vehicleType,
      capacityQuintals: estimate.capacityQuintals,
      estimatedCost: estimate.estimatedCost,
      tariffBreakdown: estimate.tariffBreakdown,
      pickupDate,
      expectedDeliveryDate,
      status: 'pending',
      carrierNotes: customData.carrierNotes || 'Direct farm-to-hub aggregated dispatch',
      timeline: [
        {
          status: 'pending',
          updatedBy: userId || order.seller,
          note: 'Logistics tracking initialized for order consignment.',
          timestamp: new Date(),
        },
      ],
    });

    await logistics.save();

    // Link back to Order
    order.logistics = logistics._id;
    await order.save();

    return logistics;
  },

  /**
   * Retrieve logistics details for a given Order with participant access control.
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
      const err = new Error('Unauthorized to view logistics for this order');
      err.statusCode = 403;
      throw err;
    }

    let logistics = await Logistics.findOne({ order: order._id });

    // Gracefully auto-create default logistics if missing for an existing order
    if (!logistics) {
      try {
        logistics = await this.createForOrder(order, userId);
      } catch (err) {
        console.error('[LogisticsService] Warning creating fallback logistics:', err.message);
      }
    }

    return logistics;
  },

  /**
   * Update logistics milestone status with state transition validation.
   */
  async updateStatus(logisticsIdParam, userId, userRole, updateData = {}) {
    const newStatus = updateData.status || updateData.newStatus;
    const note = updateData.note || '';

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(logisticsIdParam);
    const query = isObjectId
      ? { $or: [{ _id: logisticsIdParam }, { logisticsId: logisticsIdParam }] }
      : { logisticsId: logisticsIdParam };

    const logistics = await Logistics.findOne(query).populate('order');
    if (!logistics) {
      const err = new Error('Logistics record not found');
      err.statusCode = 404;
      throw err;
    }

    const order = logistics.order;
    const buyerIdStr = order?.buyer?.toString();
    const sellerIdStr = order?.seller?.toString();
    const currentUserIdStr = userId?.toString();

    if (userRole !== 'admin' && buyerIdStr !== currentUserIdStr && sellerIdStr !== currentUserIdStr) {
      const err = new Error('Unauthorized to update logistics for this order');
      err.statusCode = 403;
      throw err;
    }

    const currentStatus = logistics.status;
    const allowed = ALLOWED_LOGISTICS_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newStatus)) {
      const err = new Error(
        `Invalid logistics transition from '${currentStatus}' to '${newStatus}'. Allowed: ${
          allowed.join(', ') || 'none'
        }`
      );
      err.statusCode = 400;
      throw err;
    }

    logistics.status = newStatus;
    if (updateData.driverName) logistics.driverName = updateData.driverName;
    if (updateData.driverPhone) logistics.driverPhone = updateData.driverPhone;
    if (updateData.vehicleNumber) logistics.vehicleNumber = updateData.vehicleNumber;
    if (updateData.pickupDate) logistics.pickupDate = new Date(updateData.pickupDate);
    if (updateData.deliveryDate) logistics.estimatedDeliveryDate = new Date(updateData.deliveryDate);

    if (newStatus === 'delivered') {
      logistics.actualDeliveryDate = new Date();
    }

    logistics.timeline.push({
      status: newStatus,
      updatedBy: userId,
      note: note || `Logistics status advanced to ${newStatus}`,
      timestamp: new Date(),
    });

    await logistics.save();

    // Optionally harmonize Order timeline
    if (order) {
      try {
        const orderDoc = await Order.findById(order._id);
        if (orderDoc) {
          if (newStatus === 'in_transit' && orderDoc.orderStatus !== 'in_transit') {
            orderDoc.orderStatus = 'in_transit';
            orderDoc.timeline.push({
              status: 'in_transit',
              updatedBy: userId,
              note: `Consignment in transit: ${logistics.vehicleType}`,
              timestamp: new Date(),
            });
            await orderDoc.save();
          } else if (newStatus === 'delivered' && orderDoc.orderStatus !== 'delivered') {
            orderDoc.orderStatus = 'delivered';
            orderDoc.timeline.push({
              status: 'delivered',
              updatedBy: userId,
              note: 'Consignment arrived and delivered at destination hub',
              timestamp: new Date(),
            });
            await orderDoc.save();
          }
        }
      } catch (e) {
        console.error('[LogisticsService] Warning harmonizing order timeline:', e.message);
      }
    }

    return logistics;
  },

  /**
   * Update general logistics metadata (vehicle, carrier notes, etc.)
   */
  async updateLogistics(logisticsIdParam, userId, userRole, updateData = {}) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(logisticsIdParam);
    const query = isObjectId
      ? { $or: [{ _id: logisticsIdParam }, { logisticsId: logisticsIdParam }] }
      : { logisticsId: logisticsIdParam };

    const logistics = await Logistics.findOne(query).populate('order');
    if (!logistics) {
      const err = new Error('Logistics record not found');
      err.statusCode = 404;
      throw err;
    }

    const order = logistics.order;
    const buyerIdStr = order?.buyer?.toString();
    const sellerIdStr = order?.seller?.toString();
    const currentUserIdStr = userId?.toString();

    if (userRole !== 'admin' && buyerIdStr !== currentUserIdStr && sellerIdStr !== currentUserIdStr) {
      const err = new Error('Unauthorized to modify logistics for this order');
      err.statusCode = 403;
      throw err;
    }

    if (updateData.vehicleType) logistics.vehicleType = updateData.vehicleType;
    if (updateData.carrierNotes) logistics.carrierNotes = updateData.carrierNotes;
    if (updateData.pickupDate) logistics.pickupDate = new Date(updateData.pickupDate);
    if (updateData.expectedDeliveryDate) logistics.expectedDeliveryDate = new Date(updateData.expectedDeliveryDate);

    await logistics.save();
    return logistics;
  },
};

export default logisticsService;
