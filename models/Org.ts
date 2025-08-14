
import mongoose, { Schema } from 'mongoose';
const OrgSchema = new Schema({
  name: String,
  plan: { type: String, enum: ['free','pro','business'], default: 'pro' },
  signupCode: { type: String, index: true },
  stripeCustomerId: String,
  stripeSubscriptionId: String,
}, { timestamps: true });
export default mongoose.models.Org || mongoose.model('Org', OrgSchema);
