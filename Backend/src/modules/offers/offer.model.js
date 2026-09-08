import mongoose from 'mongoose';

const negotiationHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['created', 'proposed', 'countered', 'accepted', 'rejected', 'withdrawn'],
      required: true,
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    byRole: {
      type: String,
      enum: ['buyer', 'farmer', 'fpo', 'admin'],
      required: true,
    },
    byName: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: [1, 'Price must be positive'],
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be positive'],
    },
    totalValue: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

negotiationHistorySchema.virtual('pricePerQuintal').get(function () {
  return this.price;
});

const offerSchema = new mongoose.Schema(
  {
    offerId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    lot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lot',
      required: [true, 'Produce lot reference is required'],
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
    cropName: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1 unit'],
    },
    unit: {
      type: String,
      enum: ['quintal', 'kg', 'tonne'],
      default: 'quintal',
    },
    offeredPricePerUnit: {
      type: Number,
      required: [true, 'Offered price per unit is required'],
      min: [1, 'Price per unit must be greater than 0'],
    },
    totalOfferedValue: {
      type: Number,
      required: true,
    },
    deliveryLocation: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    expectedDeliveryDate: {
      type: Date,
    },
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'pending_seller_response',
        'pending_buyer_response',
        'countered',
        'accepted',
        'rejected',
        'withdrawn',
        'expired',
      ],
      default: 'pending_seller_response',
      index: true,
    },
    lastActionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    lastActionRole: {
      type: String,
      enum: ['buyer', 'farmer', 'fpo'],
    },
    history: [negotiationHistorySchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

offerSchema.virtual('currentOfferedPricePerQuintal').get(function () {
  return this.offeredPricePerUnit;
});

offerSchema.virtual('offeredTotalAmount').get(function () {
  return this.totalOfferedValue;
});

offerSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Indexes for fast lookup
offerSchema.index({ buyer: 1, status: 1 });
offerSchema.index({ seller: 1, status: 1 });
offerSchema.index({ lot: 1, status: 1 });

export const Offer = mongoose.model('Offer', offerSchema);
export default Offer;
