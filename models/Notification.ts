
import mongoose, { Schema } from 'mongoose';
const NotificationSchema = new Schema({
  orgId: { type: String, index: true },
  userEmail: { type: String, index: true },
  type: { type: String }, // SCHEDULE_PUBLISHED, SWAP_APPROVED, SWAP_DENIED, SWAP_REQUESTED
  title: String,
  body: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });
export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
