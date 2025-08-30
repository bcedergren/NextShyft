import mongoose, { Schema } from 'mongoose';

const DemoSessionSchema = new Schema(
  {
    sessionId: { type: String, unique: true, index: true },
    orgId: { type: String, index: true },
    claimToken: { type: String, unique: true, index: true },
    expiresAt: { type: Date, index: true },
    endedAt: { type: Date },
    purgedAt: { type: Date },
    claimedAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.models.DemoSession || mongoose.model('DemoSession', DemoSessionSchema);
