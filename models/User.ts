import mongoose, { Schema } from 'mongoose';
const UserSchema = new Schema(
  {
    orgId: Schema.Types.ObjectId,
    email: { type: String, unique: true },
    name: String,
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    roles: [String],
    positions: { type: [Schema.Types.ObjectId], index: true, default: [] },
    passwordHash: { type: String, default: '' },
    reset: {
      token: { type: String, default: '' },
      expiresAt: { type: Date, default: null },
    },
    phone: String,
    phoneVerified: { type: Boolean, default: false },
    phoneVerification: {
      code: String,
      expiresAt: Date,
    },
    notificationPrefs: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      shiftReminderEnabled: { type: Boolean, default: false },
      shiftReminderHours: { type: Number, default: 1 },
    },
  },
  { timestamps: true },
);
export default mongoose.models.User || mongoose.model('User', UserSchema);
