import mongoose from 'mongoose';

const orderTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        'confirmed',
        'processing',
        'ready_for_dispatch',
        'logistics_scheduled',
        'picked_up',
        'in_transit',
        'delivered',
        'payment_pending',
        'payment_completed',
        'completed',
        'cancelled',
      ],
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    note: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: [true, 'Lot reference is required'],
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required'],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required'],
    },
    acceptedOffer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Offer',
      required: [true, 'Source accepted offer reference is required'],
      unique: true, // Prevents duplicate orders from the same accepted offer
    },
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    grade: {
      type: String,
      enum: ['A', 'B', 'C'],
      default: 'B',
    },
    variety: {
      type: String,
      default: '',
    },
    qualityStatus: {
      type: String,
      enum: ['declared', 'verified', 'pending', 'rejected'],
      default: 'declared',
    },
    qualityNotes: {
      type: String,
      default: '',
    },
    qualityRef: {
      type: String,
      default: '',
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      default: 'quintal',
    },
    agreedPricePerUnit: {
      type: Number,
      required: true,
      min: [1, 'Price must be greater than 0'],
    },
    totalValue: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'confirmed',
        'processing',
        'ready_for_dispatch',
        'logistics_scheduled',
        'picked_up',
        'in_transit',
        'delivered',
        'payment_pending',
        'payment_completed',
        'completed',
        'cancelled',
      ],
      default: 'confirmed',
      index: true,
    },
    logistics: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Logistics',
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    deliveryStatusPlaceholder: {
      type: String,
      default: 'Pending Logistics Assignment',
    },
    paymentStatusPlaceholder: {
      type: String,
      default: 'Direct Settlement / Simulated Escrow Pending',
    },
    timeline: [orderTimelineSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.virtual('status').get(function () {
  return this.orderStatus;
});

orderSchema.virtual('totalAmount').get(function () {
  return this.totalValue;
});

orderSchema.virtual('unitPrice').get(function () {
  return this.agreedPricePerUnit;
});

orderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

orderSchema.index({ buyer: 1, orderStatus: 1 });
orderSchema.index({ seller: 1, orderStatus: 1 });
orderSchema.index({ lot: 1 });

export const Order = mongoose.model('Order', orderSchema);
export default Order;
