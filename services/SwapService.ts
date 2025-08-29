import { IEmailSender } from './EmailSender';
import { IPushSender } from './PushSender';
import { NotificationRepository } from '@/repositories/NotificationRepository';
import Audit from '@/models/Audit';
import Swap from '@/models/Swap';

export class SwapService {
  constructor(
    private email: IEmailSender,
    private push: IPushSender,
    private notifRepo = new NotificationRepository(),
  ) {}

  async requestSwap(orgId: string, actorEmail: string, payload: any) {
    const doc = await (Swap as any).create({ orgId, ...payload, status: 'PENDING' });
    await (Audit as any).create({
      orgId,
      actorEmail,
      action: 'SWAP_REQUESTED',
      payload: { id: doc._id },
    });
    return doc;
  }

  async decideSwap(
    orgId: string,
    actorEmail: string,
    swapId: string,
    status: 'APPROVED' | 'DENIED',
    requesterEmail: string,
  ) {
    const doc = await (Swap as any).findByIdAndUpdate(swapId, { $set: { status } }, { new: true });
    await (Audit as any).create({
      orgId,
      actorEmail,
      action: `SWAP_${status}`,
      payload: { id: swapId },
    });
    // Notify requester
    await this.notifRepo.create({
      orgId,
      userEmail: requesterEmail,
      type: `SWAP_${status}`,
      title: `Swap ${status.toLowerCase()}`,
      body: 'Your swap request was processed.',
    });
    await this.email.send(
      requesterEmail,
      `Swap ${status.toLowerCase()}`,
      `<p>Your swap request was ${status.toLowerCase()}.</p>`,
    );
    await this.push.send([requesterEmail], {
      title: `Swap ${status.toLowerCase()}`,
      body: 'Your swap request was processed.',
      url: '/org/demo/availability',
    });
    return doc;
  }
}
