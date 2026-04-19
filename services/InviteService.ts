import Invite from '@/models/Invite';
import Org from '@/models/Org';
import User from '@/models/User';
import { limitFor } from '@/lib/planLimits';
import { IEmailSender } from './EmailSender';
import { inviteEmail } from '@/lib/emailTemplates';

export class InviteService {
  constructor(private emailSender: IEmailSender) {}

  private token() {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }

  async createInvite(orgId: string, email: string, role: string) {
    const count = await (User as any).countDocuments({ orgId });
    const org = await (Org as any).findById(orgId);
    const limit = limitFor(org?.plan).staff;
    if (count >= limit) {
      const e: any = new Error('Plan limit reached');
      e.code = 'PLAN_LIMIT';
      throw e;
    }
    const tok = this.token();
    const invite = await (Invite as any).create({ orgId, email, role, token: tok });
    const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/accept?token=${tok}`;
    await this.emailSender.send(email, 'Join NextShyft', await inviteEmail(link));
    return invite;
  }
}
