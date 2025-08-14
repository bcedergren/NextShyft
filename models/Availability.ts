import mongoose, { Schema } from 'mongoose';
const AvailabilitySchema = new Schema(
  {
    orgId: { type: String, index: true },
    userEmail: { type: String, index: true },
    weekly: {
      mon: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
      tue: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
      wed: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
      thu: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
      fri: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
      sat: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
      sun: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
    },
    dates: {
      type: Map,
      of: [{ start: String, end: String, prefer: { type: Boolean, default: false } }],
      default: {},
    },
    notes: {
      type: Map,
      of: String,
      default: {},
    },
    effectiveFrom: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);
export default mongoose.models.Availability || mongoose.model('Availability', AvailabilitySchema);
