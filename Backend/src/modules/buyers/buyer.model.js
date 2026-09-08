import mongoose from 'mongoose';

export const BUYER_TYPES = [
  'wholesaler',
  'processor',
  'retailer',
  'institutional',
  'aggregator',
  'trader',
];

const buyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    businessName: {
      type: String,
      required: [true, 'Business/Company name is required'],
      trim: true,
    },
    buyerType: {
      type: String,
      enum: {
        values: BUYER_TYPES,
        message: 'Invalid buyer type',
      },
      default: 'wholesaler',
    },
    location: {
      state: { type: String, trim: true, default: 'Maharashtra' },
      district: { type: String, trim: true, default: '' },
      facilityAddress: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
    },
    contactInfo: {
      contactPerson: { type: String, trim: true, default: '' },
      contactPhone: { type: String, trim: true, default: '' },
      contactEmail: { type: String, trim: true, default: '' },
    },
    interestedCrops: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    completionPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
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

const BuyerProfile = mongoose.model('BuyerProfile', buyerProfileSchema);

export default BuyerProfile;
