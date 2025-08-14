
import mongoose, { Schema } from 'mongoose';
const SwapRequestSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, index: true },
  scheduleId: Schema.Types.ObjectId,
  shiftId: Schema.Types.ObjectId,
  requesterId: Schema.Types.ObjectId,
  type: { type: String, enum: ['offer','direct'], required: true },
  targetUserId: Schema.Types.ObjectId,
  status: { type: String, enum: ['PENDING','MANAGER_APPROVED','DENIED','CANCELLED'], default: 'PENDING' },
  history: [{ actorId: Schema.Types.ObjectId, action: String, at: { type: Date, default: () => new Date() } }],
}, { timestamps: true });
export default mongoose.models.SwapRequest || mongoose.model('SwapRequest', SwapRequestSchema);
