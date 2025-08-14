
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import Stripe from 'stripe';

function isSuper(roles: string[]) { return roles.includes('SUPERADMIN') || roles.includes('ADMIN'); }

export async function POST() {
  const session = await getServerSession(authOptions);
  const roles = ((session?.user as any)?.roles || []) as string[];
  if (!session || !isSuper(roles)) return NextResponse.json({ error:'Forbidden' }, { status: 403 });
  if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error:'Missing STRIPE_SECRET_KEY' }, { status: 400 });
  await dbConnect();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' } as any);

  const orgs = await (Org as any).find({ stripeSubscriptionId: { $exists: true, $ne: null } }).select('stripeSubscriptionId suspended');
  let updated = 0;
  for (const org of orgs) {
    try {
      const sub = await stripe.subscriptions.retrieve(org.stripeSubscriptionId as any);
      const isActive = sub.status === 'active' || sub.status === 'trialing';
      if (isActive && org.suspended) {
        await (Org as any).updateOne({ _id: org._id }, { $set: { suspended: false }, $unset: { suspendedAt: 1 } });
        updated++;
      }
      if ((sub.status === 'past_due' || sub.status === 'unpaid' || sub.status === 'canceled') && !org.suspended) {
        await (Org as any).updateOne({ _id: org._id }, { $set: { suspended: true, suspendedAt: new Date() } });
        updated++;
      }
    } catch (e) {
      // ignore and continue
    }
  }
  return NextResponse.json({ ok: true, checked: orgs.length, updated });
}
