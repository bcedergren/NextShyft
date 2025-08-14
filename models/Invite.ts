import mongoose, { Schema } from 'mongoose';
const InviteSchema = new Schema(
  {
    orgId: { type: String, index: true },
    email: { type: String, index: true },
    role: { type: String, enum: ['EMPLOYEE', 'MANAGER', 'OWNER'], default: 'EMPLOYEE' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    token: { type: String, index: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED'],
      default: 'PENDING',
    },
  },
  { timestamps: true },
);
export default mongoose.models.Invite || mongoose.model('Invite', InviteSchema);
