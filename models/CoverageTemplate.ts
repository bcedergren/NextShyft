import mongoose, { Schema } from 'mongoose';

const CoverageTemplateSchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, index: true },
    positionId: { type: Schema.Types.ObjectId, index: true },
    dayOfWeek: { type: String, enum: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] },
    start: String,
    end: String,
    requiredCount: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export default mongoose.models.CoverageTemplate ||
  mongoose.model('CoverageTemplate', CoverageTemplateSchema);
