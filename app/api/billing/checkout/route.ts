import { requireOwner } from '@/lib/authorize';
import { BillingService } from '@/services/BillingService';
import { OrgRepository } from '@/repositories/OrgRepository';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';

export async function POST(req: Request) {
  const guard = await requireOwner({ allowWhenSuspended: true });
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  if (!process.env.STRIPE_SECRET_KEY)
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 400 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' } as any);
  await dbConnect();
  const org = await (Org as any).findById(orgId);
  const url = new URL(req.url);
  const plan = url.searchParams.get('plan') || 'pro';
  const priceId =
    plan === 'business'
      ? process.env.STRIPE_PRICE_BUSINESS || ''
      : process.env.STRIPE_PRICE_PRO || '';
  // via BillingService
  const svc = new BillingService(new OrgRepository());
  const successUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/billing/success';
  const cancelUrl = (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/org/demo/billing';
  const sessionUrl = await svc.createCheckout(orgId, priceId, successUrl, cancelUrl);
  return NextResponse.json({ url: sessionUrl });
}
