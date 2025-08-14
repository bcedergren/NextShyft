import Invite from '@/models/Invite';
export interface IInviteRepository {
  create(data: any): Promise<any>;
  deleteByToken(token: string): Promise<void>;
  findByToken(token: string): Promise<any | null>;
}
export class InviteRepository implements IInviteRepository {
  create(data: any) {
    return (Invite as any).create(data);
  }
  async deleteByToken(token: string) {
    await (Invite as any).deleteOne({ token });
  }
  findByToken(token: string) {
    return (Invite as any).findOne({ token });
  }
}
