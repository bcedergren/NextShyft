import { IEmailSender } from './EmailSender';
import { IPushSender } from './PushSender';
import Notification from '@/models/Notification';

export interface NotifyOptions {
  orgId: string;
  userEmail: string;
  type: string;
  title: string;
  body: string;
  email?: { subject: string; html: string };
  push?: { title: string; body: string; url?: string };
}

export class NotificationService {
  constructor(
    private emailSender: IEmailSender,
    private pushSender: IPushSender,
  ) {}

  async notify(opts: NotifyOptions) {
    // Persist notification
    await (Notification as any).create({
      orgId: opts.orgId,
      userEmail: opts.userEmail,
      type: opts.type,
      title: opts.title,
      body: opts.body,
    });
    // Email
    if (opts.email) {
      await this.emailSender.send(opts.userEmail, opts.email.subject, opts.email.html);
    }
    // Push
    if (opts.push) {
      await this.pushSender.send([opts.userEmail], {
        title: opts.push.title,
        body: opts.push.body,
        url: opts.push.url || '/dashboard',
      });
    }
  }
}
