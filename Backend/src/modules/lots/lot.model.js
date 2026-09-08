import mongoose from 'mongoose';

const lotSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    ownerRole: {
      type: String,
      enum: ['farmer', 'fpo'],
      required: true,
    },
    cropName: {
      type: String,
      trim: true,
      required: [true, 'Crop name is required'],
      index: true,
    },
    variety: {
      type: String,
      trim: true,
      default: '',
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.1, 'Quantity must be greater than 0'],
    },
    unit: {
      type: String,
      enum: ['quintal', 'kg', 'tonne'],
      default: 'quintal',
    },
    pricePerQuintal: {
      type: Number,
      required: [true, 'Expected price per quintal is required'],
      min: [0, 'Price must be a positive value'],
    },
    quality: {
      type: String,
      enum: ['A', 'B', 'C'],
      default: 'B',
    },
    harvestDate: {
      type: Date,
    },
    availableFrom: {
      type: Date,
      default: Date.now,
    },
    location: {
      state: { type: String, trim: true, default: 'Maharashtra' },
      district: { type: String, trim: true, default: '', index: true },
      taluka: { type: String, trim: true, default: '' },
      village: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed', 'sold'],
      default: 'draft',
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

// Compound index for common browse query
lotSchema.index({ status: 1, cropName: 1, 'location.district': 1, createdAt: -1 });

const Lot = mongoose.model('Lot', lotSchema);

export default Lot;
