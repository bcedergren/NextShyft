
import mongoose, { Schema } from 'mongoose';
const PositionSchema = new Schema({
  orgId: { type: Schema.Types.ObjectId, index: true },
  name: { type: String, required: true },
  skills: [String],
  minAge: Number,
  certifications: [String],
}, { timestamps: true });
export default mongoose.models.Position || mongoose.model('Position', PositionSchema);
