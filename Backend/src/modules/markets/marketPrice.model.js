import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      trim: true,
      required: [true, 'Crop name is required'],
      index: true,
    },
    district: {
      type: String,
      trim: true,
      required: [true, 'District is required'],
      index: true,
    },
    state: {
      type: String,
      trim: true,
      default: 'Maharashtra',
    },
    mandiName: {
      type: String,
      trim: true,
      required: [true, 'Mandi name is required'],
    },
    minPrice: {
      type: Number,
      required: [true, 'Minimum price is required'],
      min: 0,
    },
    maxPrice: {
      type: Number,
      required: [true, 'Maximum price is required'],
      min: 0,
    },
    modalPrice: {
      type: Number,
      required: [true, 'Modal price is required'],
      min: 0,
    },
    arrivalDate: {
      type: Date,
      required: [true, 'Arrival date is required'],
      index: true,
    },
    unit: {
      type: String,
      default: 'quintal',
    },
    arrivalQuantity: {
      type: Number,
      default: 0,
      min: 0,
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

// Prevent duplicate records for same mandi + crop + date
marketPriceSchema.index(
  { cropName: 1, district: 1, mandiName: 1, arrivalDate: 1 },
  { unique: true }
);

// Compound index for time-series queries
marketPriceSchema.index({ cropName: 1, district: 1, arrivalDate: -1 });

const MarketPrice = mongoose.model('MarketPrice', marketPriceSchema);

export default MarketPrice;
