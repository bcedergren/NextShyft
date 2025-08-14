
export interface IPushSender {
  send(emails: string[], payload: any): Promise<void>;
}

export class WebPushSender implements IPushSender {
  async send(emails: string[], payload: any) {
    const { sendPushToUsers } = await import('@/lib/push');
    await sendPushToUsers(emails, payload);
  }
}
