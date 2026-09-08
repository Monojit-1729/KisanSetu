import mongoose from 'mongoose';

const logisticsTimelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
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

const logisticsSchema = new mongoose.Schema(
  {
    logisticsId: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
      index: true,
    },
    origin: {
      state: { type: String, default: 'Maharashtra' },
      district: { type: String, default: '' },
      taluka: { type: String, default: '' },
      village: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    destination: {
      state: { type: String, default: 'Maharashtra' },
      district: { type: String, default: '' },
      address: { type: String, default: '' },
    },
    distanceKm: {
      type: Number,
      required: true,
      default: 30,
    },
    vehicleType: {
      type: String,
      default: 'Small Pickup Truck (Bolero/Tata Ace)',
    },
    capacityQuintals: {
      type: Number,
      default: 25,
    },
    driverName: {
      type: String,
      trim: true,
      default: '',
    },
    driverPhone: {
      type: String,
      trim: true,
      default: '',
    },
    vehicleNumber: {
      type: String,
      trim: true,
      default: '',
    },
    estimatedCost: {
      type: Number,
      required: true,
      default: 0,
    },
    tariffBreakdown: {
      baseLoading: { type: Number, default: 0 },
      transitFreight: { type: Number, default: 0 },
      ratePerKmPerQuintal: { type: Number, default: 0.4 },
    },
    pickupDate: {
      type: Date,
    },
    expectedDeliveryDate: {
      type: Date,
    },
    actualDeliveryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    carrierNotes: {
      type: String,
      trim: true,
      default: '',
    },
    timeline: [logisticsTimelineSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret.__v;
        return ret;
      },
    },
  }
);

logisticsSchema.index({ status: 1, createdAt: -1 });

export const Logistics = mongoose.model('Logistics', logisticsSchema);
export default Logistics;
