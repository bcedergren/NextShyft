import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import { limitFor } from '@/lib/planLimits';
import { inviteEmail } from '@/lib/emailTemplates';
import Invite from '@/models/Invite';
import { Resend } from 'resend';

function token() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  const { email, code } = await req.json();
  if (!email || !code) return NextResponse.json({ error: 'Missing' }, { status: 400 });
  await dbConnect();
  const org = await (Org as any).findOne({ signupCode: code });
  if (!org) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

  const count = await User.countDocuments({ orgId: String(org._id) });
  const limit = limitFor(org?.plan).staff;
  if (count >= limit)
    return NextResponse.json({ error: 'Plan limit reached', upgrade: true }, { status: 402 });

  // Create an invite and email a join link to accept
  const tok = token();
  await (Invite as any).create({ orgId: String(org._id), email, role: 'EMPLOYEE', token: tok });
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/accept?token=${tok}`;
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@nextshyft.app',
      to: email,
      subject: 'Join NextShyft',
      html: inviteEmail(link),
    });
  }
  return NextResponse.json({ ok: true });
}
