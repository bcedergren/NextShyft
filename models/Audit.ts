
import mongoose, { Schema } from 'mongoose';
const AuditSchema = new Schema({
  orgId: { type: String, index: true },
  actorEmail: String,
  action: String, // e.g., SHIFT_ASSIGN, SOLVER_RUN, SCHEDULE_PUBLISH, SWAP_APPROVE
  payload: Schema.Types.Mixed,
  at: { type: Date, default: () => new Date() },
}, { timestamps: true });
export default mongoose.models.Audit || mongoose.model('Audit', AuditSchema);
