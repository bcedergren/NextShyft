
export interface IEmailSender {
  send(to: string, subject: string, html: string): Promise<void>;
}

export class ResendEmailSender implements IEmailSender {
  private from: string;
  constructor(private apiKey?: string, from?: string) {
    this.from = from || process.env.EMAIL_FROM || 'noreply@nextshyft.app';
  }
  async send(to: string, subject: string, html: string) {
    if (!this.apiKey && !process.env.RESEND_API_KEY) return;
    const { Resend } = await import('resend');
    const resend = new Resend(this.apiKey || process.env.RESEND_API_KEY!);
    await resend.emails.send({ from: this.from, to, subject, html });
  }
}
