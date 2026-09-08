import mongoose from 'mongoose';
import crypto from 'crypto';

const demandSchema = new mongoose.Schema(
  {
    demandId: {
      type: String,
      unique: true,
      index: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required'],
      index: true,
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      index: true,
    },
    variety: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Required quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      enum: ['quintal', 'kg', 'tonne'],
      default: 'quintal',
    },
    quality: {
      type: String,
      enum: ['A', 'B', 'C', 'Any'],
      default: 'B',
    },
    deliveryLocation: {
      state: { type: String, trim: true, default: 'Maharashtra' },
      district: { type: String, trim: true, required: [true, 'Delivery district is required'], index: true },
      taluka: { type: String, trim: true, default: '' },
      village: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
      deliveryAddress: { type: String, trim: true, default: '' },
    },
    deliveryWindow: {
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: {
        type: Date,
        required: [true, 'Delivery end date is required'],
      },
    },
    targetPrice: {
      type: Number,
      min: [0, 'Target price must be positive'],
    },
    status: {
      type: String,
      enum: ['active', 'fulfilled', 'expired', 'cancelled'],
      default: 'active',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Generate human-readable demandId before save if not present
demandSchema.pre('save', function (next) {
  if (!this.demandId) {
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    this.demandId = `DEM-${randomHex}`;
  }
  next();
});

// Index for common matching queries
demandSchema.index({ status: 1, cropName: 1, 'deliveryLocation.district': 1, 'deliveryWindow.endDate': 1 });

const Demand = mongoose.model('Demand', demandSchema);

export default Demand;
