
import mongoose, { Schema } from 'mongoose';
const AnnouncementReadSchema = new Schema({
  orgId: { type: String, index: true },
  announcementId: { type: String, index: true },
  userEmail: { type: String, index: true },
  readAt: { type: Date, default: () => new Date() },
}, { timestamps: true });
export default mongoose.models.AnnouncementRead || mongoose.model('AnnouncementRead', AnnouncementReadSchema);
