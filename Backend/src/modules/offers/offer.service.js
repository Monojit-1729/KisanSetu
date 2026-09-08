import { Offer } from './offer.model.js';
import { Lot } from '../lots/index.js';
import { User } from '../users/index.js';
import orderService from '../orders/order.service.js';

export const offerService = {
  /**
   * Create a binding commercial offer from a buyer on an active lot.
   */
  async createOffer(buyerId, payload) {
    const {
      lotId,
      quantity,
      offeredPricePerUnit,
      pricePerQuintal,
      price: rawPrice,
      message = '',
      note = '',
      deliveryLocation = {},
      expectedDeliveryDate,
    } = payload;

    const qty = Number(quantity);
    const price = Number(offeredPricePerUnit || pricePerQuintal || rawPrice);
    const msg = message || note || '';

    if (!qty || qty <= 0) {
      const err = new Error('Offer quantity must be greater than 0');
      err.statusCode = 400;
      throw err;
    }
    if (!price || price <= 0) {
      const err = new Error('Offered price per unit must be greater than 0');
      err.statusCode = 400;
      throw err;
    }

    const lot = await Lot.findById(lotId).populate('owner', 'name role');
    if (!lot) {
      const err = new Error('Produce lot not found');
      err.statusCode = 404;
      throw err;
    }

    if (lot.status !== 'active') {
      const err = new Error(`Cannot make an offer on a ${lot.status} lot. Offers are only accepted on active listings.`);
      err.statusCode = 400;
      throw err;
    }

    const sellerId = lot.owner?._id || lot.owner;
    if (sellerId.toString() === buyerId.toString()) {
      const err = new Error('Cannot submit a purchase offer on your own produce lot');
      err.statusCode = 400;
      throw err;
    }

    if (qty > lot.quantity) {
      const err = new Error(
        `Offered quantity (${qty} ${lot.unit}) exceeds available produce lot quantity (${lot.quantity} ${lot.unit})`
      );
      err.statusCode = 400;
      throw err;
    }

    const buyerUser = await User.findById(buyerId);
    const buyerName = buyerUser?.name || 'Commercial Buyer';

    const totalValue = Number((qty * price).toFixed(2));
    const offerId = `OFF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const offer = new Offer({
      offerId,
      lot: lot._id,
      buyer: buyerId,
      seller: sellerId,
      cropName: lot.cropName,
      quantity: qty,
      unit: lot.unit || 'quintal',
      offeredPricePerUnit: price,
      totalOfferedValue: totalValue,
      deliveryLocation,
      expectedDeliveryDate,
      message: msg,
      status: 'pending_seller_response',
      lastActionBy: buyerId,
      lastActionRole: 'buyer',
      history: [
        {
          action: 'proposed',
          by: buyerId,
          byRole: 'buyer',
          byName: buyerName,
          price,
          quantity: qty,
          totalValue,
          message: msg || `Initial commercial offer of ₹${price}/${lot.unit || 'q'} submitted.`,
          timestamp: new Date(),
        },
      ],
    });

    await offer.save();
    await offer.populate(['buyer', 'seller', 'lot']);

    const obj = offer.toJSON();
    return {
      ...obj,
      currentOfferedPricePerQuintal: price,
      offeredTotalAmount: totalValue,
    };
  },

  /**
   * Respond to an offer (accept, reject, counter, or withdraw).
   */
  async respondToOffer(userId, userRole, offerId, payload = {}) {
    const {
      action,
      counterPrice,
      counterPricePerQuintal,
      counterQuantity,
      message = '',
      note = '',
    } = payload;
    const msg = message || note || '';

    const validActions = ['accept', 'reject', 'counter', 'withdraw'];
    if (!validActions.includes(action)) {
      const err = new Error(`Invalid action '${action}'. Allowed: ${validActions.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(offerId);
    const query = isObjectId ? { $or: [{ _id: offerId }, { offerId }] } : { offerId };

    const offer = await Offer.findOne(query).populate('buyer', 'name role').populate('seller', 'name role');
    if (!offer) {
      const err = new Error('Offer not found');
      err.statusCode = 404;
      throw err;
    }

    const buyerIdStr = offer.buyer?._id?.toString() || offer.buyer?.toString();
    const sellerIdStr = offer.seller?._id?.toString() || offer.seller?.toString();
    const currentUserIdStr = userId.toString();

    const isBuyer = buyerIdStr === currentUserIdStr;
    const isSeller = sellerIdStr === currentUserIdStr;

    if (!isBuyer && !isSeller && userRole !== 'admin') {
      const err = new Error('Unauthorized to respond to this offer');
      err.statusCode = 403;
      throw err;
    }

    // Disallow transitions on terminal states
    if (['accepted', 'rejected', 'withdrawn', 'expired'].includes(offer.status)) {
      const err = new Error(`Cannot modify an offer that has already been ${offer.status}`);
      err.statusCode = 400;
      throw err;
    }

    const responderUser = await User.findById(userId);
    const responderName = responderUser?.name || (isBuyer ? 'Buyer' : 'Seller');
    const effectiveRole = isBuyer ? 'buyer' : userRole === 'fpo' ? 'fpo' : 'farmer';

    let resultingOrder = null;

    if (action === 'accept') {
      if (offer.lastActionBy?.toString() === currentUserIdStr) {
        const err = new Error('Cannot accept your own pending proposal. Await the other party’s response.');
        err.statusCode = 400;
        throw err;
      }

      offer.status = 'accepted';
      offer.lastActionBy = userId;
      offer.lastActionRole = effectiveRole;
      offer.history.push({
        action: 'accepted',
        by: userId,
        byRole: effectiveRole,
        byName: responderName,
        price: offer.offeredPricePerUnit,
        quantity: offer.quantity,
        totalValue: offer.totalOfferedValue,
        message: msg || `Offer accepted at ₹${offer.offeredPricePerUnit}/${offer.unit}.`,
        timestamp: new Date(),
      });

      await offer.save();

      // Trigger automatic Order generation
      resultingOrder = await orderService.createOrderFromOffer(offer, userId);
    } else if (action === 'reject') {
      if (offer.lastActionBy?.toString() === currentUserIdStr) {
        const err = new Error('Cannot reject your own proposal. Use withdraw instead.');
        err.statusCode = 400;
        throw err;
      }

      offer.status = 'rejected';
      offer.lastActionBy = userId;
      offer.lastActionRole = effectiveRole;
      offer.history.push({
        action: 'rejected',
        by: userId,
        byRole: effectiveRole,
        byName: responderName,
        price: offer.offeredPricePerUnit,
        quantity: offer.quantity,
        totalValue: offer.totalOfferedValue,
        message: msg || 'Offer declined.',
        timestamp: new Date(),
      });

      await offer.save();
    } else if (action === 'withdraw') {
      if (offer.lastActionBy?.toString() !== currentUserIdStr && userRole !== 'admin') {
        const err = new Error('You can only withdraw a proposal that you submitted.');
        err.statusCode = 400;
        throw err;
      }

      offer.status = 'withdrawn';
      offer.lastActionBy = userId;
      offer.lastActionRole = effectiveRole;
      offer.history.push({
        action: 'withdrawn',
        by: userId,
        byRole: effectiveRole,
        byName: responderName,
        price: offer.offeredPricePerUnit,
        quantity: offer.quantity,
        totalValue: offer.totalOfferedValue,
        message: msg || 'Offer withdrawn by sender.',
        timestamp: new Date(),
      });

      await offer.save();
    } else if (action === 'counter') {
      if (offer.lastActionBy?.toString() === currentUserIdStr) {
        const err = new Error('Cannot counter your own proposal before the other party responds.');
        err.statusCode = 400;
        throw err;
      }

      const cPrice = Number(counterPrice || counterPricePerQuintal);
      const cQty = counterQuantity ? Number(counterQuantity) : offer.quantity;

      if (!cPrice || cPrice <= 0) {
        const err = new Error('Counter-offer must specify a positive price per unit');
        err.statusCode = 400;
        throw err;
      }
      if (!cQty || cQty <= 0) {
        const err = new Error('Counter-offer quantity must be positive');
        err.statusCode = 400;
        throw err;
      }

      offer.offeredPricePerUnit = cPrice;
      offer.quantity = cQty;
      offer.totalOfferedValue = Number((cQty * cPrice).toFixed(2));
      offer.status = isBuyer ? 'pending_seller_response' : 'pending_buyer_response';
      offer.lastActionBy = userId;
      offer.lastActionRole = effectiveRole;

      offer.history.push({
        action: 'countered',
        by: userId,
        byRole: effectiveRole,
        byName: responderName,
        price: cPrice,
        quantity: cQty,
        totalValue: offer.totalOfferedValue,
        message: msg || `Counter-offer of ₹${cPrice}/${offer.unit} proposed.`,
        timestamp: new Date(),
      });

      await offer.save();
    }

    await offer.populate(['buyer', 'seller', 'lot']);
    const updatedOffer = offer.toJSON();

    return {
      offer: {
        ...updatedOffer,
        currentOfferedPricePerQuintal: offer.offeredPricePerUnit,
        offeredTotalAmount: offer.totalOfferedValue,
        history: (updatedOffer.history || []).map((h) => ({
          ...h,
          pricePerQuintal: h.price,
        })),
      },
      order: resultingOrder ? (resultingOrder.toJSON ? resultingOrder.toJSON() : resultingOrder) : null,
    };
  },

  /**
   * Get all offers involving the authenticated user.
   */
  async getMyOffers(userId, userRole, { status } = {}) {
    const query = {
      $or: [{ buyer: userId }, { seller: userId }],
    };

    if (status) {
      query.status = status;
    }

    const offers = await Offer.find(query)
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role')
      .populate('lot', 'cropName variety quality location pricePerQuintal quantity unit status')
      .sort({ updatedAt: -1 })
      .lean();

    return offers.map((o) => ({
      ...o,
      id: o._id.toString(),
      currentOfferedPricePerQuintal: o.offeredPricePerUnit,
      offeredTotalAmount: o.totalOfferedValue,
      history: (o.history || []).map((h) => ({
        ...h,
        pricePerQuintal: h.price,
      })),
    }));
  },

  /**
   * Get all offers placed on a specific lot (seller/owner only).
   */
  async getOffersForLot(lotId, userId, userRole) {
    const lot = await Lot.findById(lotId);
    if (!lot) {
      const err = new Error('Produce lot not found');
      err.statusCode = 404;
      throw err;
    }

    const ownerIdStr = lot.owner?.toString();
    if (userRole !== 'admin' && ownerIdStr !== userId.toString()) {
      const err = new Error('Unauthorized to view offers for this lot');
      err.statusCode = 403;
      throw err;
    }

    const offers = await Offer.find({ lot: lotId })
      .populate('buyer', 'name email role')
      .sort({ updatedAt: -1 })
      .lean();

    return offers.map((o) => ({
      ...o,
      id: o._id.toString(),
      currentOfferedPricePerQuintal: o.offeredPricePerUnit,
      offeredTotalAmount: o.totalOfferedValue,
      history: (o.history || []).map((h) => ({
        ...h,
        pricePerQuintal: h.price,
      })),
    }));
  },

  /**
   * Get single offer by ID.
   */
  async getOfferById(offerId, userId, userRole) {
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(offerId);
    const query = isObjectId ? { $or: [{ _id: offerId }, { offerId }] } : { offerId };

    const offer = await Offer.findOne(query)
      .populate('buyer', 'name email role')
      .populate('seller', 'name email role')
      .populate('lot')
      .lean();

    if (!offer) {
      const err = new Error('Offer not found');
      err.statusCode = 404;
      throw err;
    }

    const buyerIdStr = offer.buyer?._id?.toString() || offer.buyer?.toString();
    const sellerIdStr = offer.seller?._id?.toString() || offer.seller?.toString();
    const currentUserIdStr = userId.toString();

    if (userRole !== 'admin' && buyerIdStr !== currentUserIdStr && sellerIdStr !== currentUserIdStr) {
      const err = new Error('Unauthorized to view this offer');
      err.statusCode = 403;
      throw err;
    }

    return {
      ...offer,
      id: offer._id.toString(),
      currentOfferedPricePerQuintal: offer.offeredPricePerUnit,
      offeredTotalAmount: offer.totalOfferedValue,
      history: (offer.history || []).map((h) => ({
        ...h,
        pricePerQuintal: h.price,
      })),
    };
  },
};

export default offerService;
