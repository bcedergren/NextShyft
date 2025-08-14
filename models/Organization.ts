
import mongoose, { Schema } from 'mongoose';
const OrganizationSchema = new Schema({
  name: String,
  slug: String,
  ownerUserId: Schema.Types.ObjectId,
}, { timestamps: true });
export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);
