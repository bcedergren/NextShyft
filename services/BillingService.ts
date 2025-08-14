import Stripe from 'stripe';
import { IOrgRepository } from '@/repositories/OrgRepository';

export class BillingService {
  private async setPlanFromPrice(priceId?: string) {
    if (!priceId) return 'pro';
    const map: Record<string, string> = {
      [process.env.STRIPE_PRICE_PRO || '']: 'pro',
      [process.env.STRIPE_PRICE_BUSINESS || '']: 'business',
    };
    return map[priceId] || 'pro';
  }
  private stripe: Stripe;
  constructor(
    private orgs: IOrgRepository,
    secret = process.env.STRIPE_SECRET_KEY || '',
  ) {
    this.stripe = new Stripe(secret, { apiVersion: '2024-06-20' } as any);
  }

  async createCheckout(orgId: string, priceId: string, successUrl: string, cancelUrl: string) {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { orgId },
    });
    return session.url;
  }

  async handleWebhook(buf: Buffer, signature: string, webhookSecret: string) {
    const list = (
      process.env.STRIPE_WEBHOOK_EVENT_ALLOWLIST ||
      'checkout.session.completed,customer.subscription.updated,invoice.payment_succeeded'
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allowedEvents = new Set(list);
    const event = this.stripe.webhooks.constructEvent(buf, signature, webhookSecret);
    if (!allowedEvents.has(event.type)) {
      return { ok: true, ignored: event.type } as any;
    }
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orgId = session.metadata?.orgId as string | undefined;
      const subId = session.subscription as string | null;
      const plan = await this.setPlanFromPrice(
        (session as any)?.line_items?.[0]?.price?.id || undefined,
      );
      if (orgId) {
        await this.orgs.updateById(orgId, {
          plan,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subId || undefined,
          suspended: false,
          suspendedAt: undefined,
        });
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object as Stripe.Subscription;
      // find org by sub id (not implemented in repo -> kept simple)
    }

    if (
      event.type === 'invoice.payment_succeeded' ||
      event.type === 'customer.subscription.updated'
    ) {
      const obj: any = event.data.object as any;
      const customerId = (obj.customer &&
        (typeof obj.customer === 'string' ? obj.customer : obj.customer.id)) as string;
      if (customerId) {
        // naive: unsuspend all orgs with this customerId
        const OrgModel: any = (await import('@/models/Org')).default as any;
        const found = await OrgModel.findOne({ stripeCustomerId: customerId });
        await this.orgs.updateById(found?._id, { suspended: false, suspendedAt: undefined });
      }
    }

    return { ok: true };
  }
}
