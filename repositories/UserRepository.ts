import User from '@/models/User';
import { Types } from 'mongoose';
export interface IUserRepository {
  countByOrg(orgId: string): Promise<number>;
  findByEmail(email: string): Promise<any | null>;
  findByOrg(orgId: string): Promise<any[]>;
}
export class UserRepository implements IUserRepository {
  async countByOrg(orgId: string) {
    return (User as any).countDocuments({ orgId });
  }
  async findByEmail(email: string) {
    return (User as any).findOne({ email });
  }
  async findByOrg(orgId: string) {
    const id = Types.ObjectId.isValid(orgId) ? new Types.ObjectId(orgId) : orgId;
    return (User as any).find({ orgId: id });
  }
}
