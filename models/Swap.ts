import mongoose, { Schema } from 'mongoose';

const SwapSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, index: true },
    userId: { type: Schema.Types.ObjectId, index: true },
    shiftId: { type: Schema.Types.ObjectId, index: true },
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  },
  { timestamps: true },
);

export default mongoose.models.Swap || mongoose.model('Swap', SwapSchema);


