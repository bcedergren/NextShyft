import mongoose, { Schema } from 'mongoose';
const ScheduleSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, index: true },
    periodStart: Date,
    periodEnd: Date,
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    version: { type: Number, default: 1 },
    notes: String,
    publishedAt: { type: Date },
  },
  { timestamps: true },
);
export default mongoose.models.Schedule || mongoose.model('Schedule', ScheduleSchema);
