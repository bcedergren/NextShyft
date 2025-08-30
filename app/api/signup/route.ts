import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import Invite from '@/models/Invite';
import DemoSession from '@/models/DemoSession';
import crypto from 'crypto';
import { Resend } from 'resend';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const {
    email,
    firstName = '',
    lastName = '',
    password,
    plan = 'free',
    importDemo,
    orgId: importOrgId,
    claimToken,
  } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await dbConnect();
  const lower = String(email).toLowerCase();
  // Prevent duplicate accounts before creating an org
  const existing = await (User as any).findOne({ email: lower }).select('_id');
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  // Create org and owner user
  let org: any;
  let createdNewOrg = false;
  try {
    const initialPlan = plan === 'pro' || plan === 'business' ? plan : 'free';
    if (importDemo && importOrgId && claimToken) {
      // Verify claim
      const ds = await (DemoSession as any)
        .findOne({ orgId: String(importOrgId), claimToken })
        .select('_id expiresAt claimedAt');
      if (!ds) return NextResponse.json({ error: 'Invalid claim' }, { status: 400 });
      if (ds.claimedAt) return NextResponse.json({ error: 'Already claimed' }, { status: 409 });
      if (ds.expiresAt && ds.expiresAt < new Date())
        return NextResponse.json({ error: 'Claim expired' }, { status: 410 });
      // Claim the demo org by turning off demo flag; preserve its existing name
      await (Org as any).updateOne({ _id: importOrgId }, { $set: { isDemo: false } });
      org = await (Org as any).findById(importOrgId).select('_id name');
      await (DemoSession as any).updateOne({ _id: ds._id }, { $set: { claimedAt: new Date() } });
    } else {
      // Create a fresh org
      const resolvedName = firstName
        ? `${firstName}'s Organization`
        : (lower.split('@')[0] || 'My Organization') + "'s Organization";
      org = await (Org as any).create({ name: resolvedName, plan: initialPlan });
      createdNewOrg = true;
    }
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const user = await (User as any).create({
      orgId: org._id,
      email: lower,
      firstName,
      lastName,
      roles: ['OWNER'],
      passwordHash: hash,
      positions: [],
    });
    await (Invite as any).updateMany(
      { email: user.email, orgId: String(org._id), status: 'PENDING' },
      { $set: { status: 'ACCEPTED' } },
    );
    // Send welcome/confirmation email (best-effort)
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
      if (apiKey) {
        const resend = new Resend(apiKey);
        // Load org name for email
        const orgDoc = await (Org as any).findById(org._id).select('name');
        const orgNameResolved = orgDoc?.name || 'your organization';
        await resend.emails.send({
          from,
          to: user.email,
          subject: 'Welcome to NextShyft',
          html: `<h3>Welcome${firstName ? `, ${firstName}` : ''}!</h3><p>Your organization \"${orgNameResolved}\" is ready.</p><p>You can sign in here: <a href=\"${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/signin\">Sign in</a></p>`,
        });
      }
    } catch {}
    // If paid plan selected and Stripe configured, start checkout
    if ((plan === 'pro' || plan === 'business') && process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' } as any);
      const priceId =
        plan === 'business'
          ? process.env.STRIPE_PRICE_BUSINESS || ''
          : process.env.STRIPE_PRICE_PRO || '';
      if (priceId) {
        const session = await stripe.checkout.sessions.create({
          mode: 'subscription',
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/billing/success',
          cancel_url: (process.env.NEXTAUTH_URL || 'http://localhost:3000') + '/org/demo/billing',
          metadata: { orgId: String(org._id) },
        });
        return NextResponse.json({ ok: true, orgId: String(org._id), checkoutUrl: session.url });
      }
    }
    return NextResponse.json({ ok: true, orgId: String(org._id) });
  } catch (e) {
    // Best-effort cleanup if user creation failed after org creation
    try {
      if (createdNewOrg && org?._id) await (Org as any).deleteOne({ _id: org._id });
    } catch {}
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
