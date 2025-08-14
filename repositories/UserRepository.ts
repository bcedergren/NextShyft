import User from '@/models/User';
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
    return (User as any).find({ orgId });
  }
}
