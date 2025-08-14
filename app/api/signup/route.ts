import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import Invite from '@/models/Invite';
import crypto from 'crypto';
import { Resend } from 'resend';

export async function POST(req: Request) {
  const { orgName, email, firstName = '', lastName = '', password } = await req.json();
  if (!orgName || !email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  await dbConnect();
  const lower = String(email).toLowerCase();
  // Prevent duplicate accounts before creating an org
  const existing = await (User as any).findOne({ email: lower }).select('_id');
  if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });

  // Create org and owner user
  let org: any;
  try {
    org = await (Org as any).create({ name: orgName, plan: 'pro' });
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
        await resend.emails.send({
          from,
          to: user.email,
          subject: 'Welcome to NextShyft',
          html: `<h3>Welcome${firstName ? `, ${firstName}` : ''}!</h3><p>Your organization "${orgName}" has been created.</p><p>You can sign in here: <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/signin">Sign in</a></p>`,
        });
      }
    } catch {}
    return NextResponse.json({ ok: true, orgId: String(org._id) });
  } catch (e) {
    // Best-effort cleanup if user creation failed after org creation
    try {
      if (org?._id) await (Org as any).deleteOne({ _id: org._id });
    } catch {}
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
