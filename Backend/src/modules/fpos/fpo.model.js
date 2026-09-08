import mongoose from 'mongoose';

const fpoProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fpoName: {
      type: String,
      required: [true, 'FPO name is required'],
      trim: true,
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      state: { type: String, trim: true, default: 'Maharashtra' },
      district: { type: String, trim: true, default: '' },
      officeAddress: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
    },
    contactInfo: {
      contactPerson: { type: String, trim: true, default: '' },
      contactPhone: { type: String, trim: true, default: '' },
      contactEmail: { type: String, trim: true, default: '' },
    },
    memberCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    majorCrops: {
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

const FpoProfile = mongoose.model('FpoProfile', fpoProfileSchema);

export default FpoProfile;
