import mongoose, { Schema } from 'mongoose';
const OrgPolicySchema = new Schema(
  {
    orgId: { type: Schema.Types.ObjectId, unique: true },
    cadence: { type: String, default: 'monthly' },
    periodLengthDays: Number,
    constraints: {
      maxHoursPerWeek: Number,
      minRestHours: Number,
      maxConsecutiveDays: Number,
      requireRoleMatch: { type: Boolean, default: true },
    },
    softPreferences: {
      fairnessWeight: { type: Number, default: 1 },
      preferAvailabilityWeight: { type: Number, default: 1 },
      avoidOvertimeWeight: { type: Number, default: 1 },
      weekendBalanceWeight: { type: Number, default: 1 },
    },
    swaps: {
      managerApprovalRequired: { type: Boolean, default: true },
      notifyEligibleCoworkers: { type: Boolean, default: true },
    },
    pto: {
      enabled: { type: Boolean, default: true },
      minNoticeDays: Number,
      blackoutDates: [Date],
    },
    holidays: [
      {
        name: { type: String, required: true },
        date: { type: String, required: true }, // ISO YYYY-MM-DD
        type: { type: String, enum: ['PAID', 'UNPAID', 'OBSERVED'], default: 'PAID' },
      },
    ],
  },
  { timestamps: true },
);
export default mongoose.models.OrgPolicy || mongoose.model('OrgPolicy', OrgPolicySchema);
