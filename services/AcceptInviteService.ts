import { IInviteRepository } from '@/repositories/InviteRepository';
import User from '@/models/User';
import Audit from '@/models/Audit';

export class AcceptInviteService {
  constructor(private invites: IInviteRepository) {}
  async accept(token: string) {
    const inv = await this.invites.findByToken(token);
    if (!inv) throw new Error('Invalid token');
    const user = await (User as any).findOneAndUpdate(
      { email: inv.email },
      { $set: { orgId: String(inv.orgId), roles: [inv.role] } },
      { upsert: true, new: true },
    );
    await this.invites.deleteByToken(token);
    await (Audit as any).create({
      orgId: String(inv.orgId),
      actorEmail: inv.email,
      action: 'INVITE_ACCEPTED',
      payload: { role: inv.role },
    });
    return { orgId: String(inv.orgId), email: inv.email, role: inv.role };
  }
}
