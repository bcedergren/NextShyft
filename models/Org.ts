import mongoose, { Schema } from 'mongoose';
const OrgSchema = new Schema(
  {
    name: { type: String, required: true },
    plan: { type: String, enum: ['free', 'pro', 'business'], default: 'pro' },
    signupCode: { type: String, index: true },
    stripeCustomerId: String,
    stripeSubscriptionId: String,
    suspended: { type: Boolean, default: false },
    suspendedAt: { type: Date },
    isDemo: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);
export default mongoose.models.Org || mongoose.model('Org', OrgSchema);
