
import mongoose, { Schema } from 'mongoose';
const ShiftSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, index: true },
  scheduleId: { type: Schema.Types.ObjectId, index: true },
  date: Date,
  positionId: { type: Schema.Types.ObjectId, index: true },
  start: String, // 'HH:mm'
  end: String,   // 'HH:mm'
  requiredCount: { type: Number, default: 1 },
  assignments: [{ userId: Schema.Types.ObjectId }],
  notes: String,
}, { timestamps: true });
export default mongoose.models.Shift || mongoose.model('Shift', ShiftSchema);
