import mongoose, { Schema } from 'mongoose';
const AnnouncementSchema = new Schema(
  {
    // orgId: org ObjectId for org-scoped, or '*' for global (super admin)
    orgId: { type: String, index: true },
    title: String,
    body: String,
    pinned: { type: Boolean, default: false },
    publishAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);
export default mongoose.models.Announcement || mongoose.model('Announcement', AnnouncementSchema);
