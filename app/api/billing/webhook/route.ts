import { BillingService } from '@/services/BillingService';
import { OrgRepository } from '@/repositories/OrgRepository';

import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || '';
  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const buf = Buffer.from(await req.arrayBuffer());
  const svc = new BillingService(new OrgRepository());
  try {
    await svc.handleWebhook(buf, sig, secret);
  } catch (e: any) {
    return new NextResponse(`Webhook Error: ${e.message}`, { status: 400 });
  }
  return new NextResponse('ok');
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const preferredRegion = 'auto';
