import mongoose from 'mongoose';

const smsLogSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    farmerName: {
      type: String,
      default: '',
    },
    incomingMessage: {
      type: String,
      required: true,
      trim: true,
    },
    outgoingResponse: {
      type: String,
      required: true,
    },
    command: {
      type: String,
      enum: ['SELL', 'BUY', 'HELP', 'UNKNOWN', 'EMPTY'],
      default: 'UNKNOWN',
    },
    status: {
      type: String,
      enum: ['success', 'rejected', 'error'],
      default: 'success',
    },
    sessionData: {
      crop: { type: String, default: '' },
      quantity: { type: Number, default: 0 },
      unit: { type: String, default: 'kg' },
      options: { type: mongoose.Schema.Types.Mixed, default: null },
      expiresAt: { type: Date, default: null },
    },
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

smsLogSchema.index({ phone: 1, createdAt: -1 });

export const SmsLog = mongoose.model('SmsLog', smsLogSchema);
export default SmsLog;
