import mongoose from 'mongoose';

const farmerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    location: {
      state: { type: String, trim: true, default: 'Maharashtra' },
      district: { type: String, trim: true, default: '' },
      taluka: { type: String, trim: true, default: '' },
      village: { type: String, trim: true, default: '' },
      pincode: { type: String, trim: true, default: '' },
    },
    preferredLanguage: {
      type: String,
      enum: ['en', 'hi', 'mr'],
      default: 'en',
    },
    cropInterests: {
      type: [String],
      default: [],
    },
    farmInfo: {
      totalLandAcres: { type: Number, min: 0, default: 0 },
      soilType: { type: String, trim: true, default: '' },
      irrigationSource: { type: String, trim: true, default: '' },
    },
    fpoAffiliation: {
      isMember: { type: Boolean, default: false },
      fpoName: { type: String, trim: true, default: '' },
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

const FarmerProfile = mongoose.model('FarmerProfile', farmerProfileSchema);

export default FarmerProfile;
