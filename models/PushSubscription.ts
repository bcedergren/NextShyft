
import mongoose, { Schema } from 'mongoose';
const PushSubSchema = new Schema({
  orgId: { type: String, index: true },
  userEmail: { type: String, index: true },
  subscription: Schema.Types.Mixed,
}, { timestamps: true });
export default mongoose.models.PushSubscription || mongoose.model('PushSubscription', PushSubSchema);
