import mongoose, { Schema } from 'mongoose';
const ShiftTemplateSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, index: true },
    positionId: { type: Schema.Types.ObjectId, index: true },
    dayOfWeek: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] },
    start: String,
    end: String,
    requiredCount: { type: Number, default: 1 },
  },
  { timestamps: true },
);
export default mongoose.models.ShiftTemplate ||
  mongoose.model('ShiftTemplate', ShiftTemplateSchema);
