import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import { limitFor } from '@/lib/planLimits';
import { inviteEmail } from '@/lib/emailTemplates';
import Invite from '@/models/Invite';
import { Resend } from 'resend';
import crypto from 'crypto';

function token() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  const { email, code, password, firstName = '', lastName = '' } = await req.json();
  if (!email || !code) return NextResponse.json({ error: 'Missing email or code' }, { status: 400 });
  await dbConnect();
  
  const org = await (Org as any).findOne({ signupCode: code });
  if (!org) return NextResponse.json({ error: 'Invalid code' }, { status: 400 });

  // Check if user already exists
  const existingUser = await (User as any).findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
  }

  const count = await User.countDocuments({ orgId: String(org._id) });
  const limit = limitFor(org?.plan).staff;
  if (count >= limit)
    return NextResponse.json({ error: 'Plan limit reached', upgrade: true }, { status: 402 });

  try {
    // If password is provided, create user directly
    if (password) {
      const hash = crypto.createHash('sha256').update(password).digest('hex');
      await (User as any).create({
        orgId: String(org._id),
        email: email.toLowerCase(),
        firstName,
        lastName,
        roles: ['EMPLOYEE'],
        passwordHash: hash,
        positions: [],
      });
      
      // Send welcome email
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@nextshyft.app',
          to: email,
          subject: `Welcome to ${org.name} on NextShyft`,
          html: `<h3>Welcome${firstName ? `, ${firstName}` : ''}!</h3><p>You've successfully joined "${org.name}" on NextShyft.</p><p>You can sign in here: <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/signin">Sign in</a></p>`,
        });
      }
      
      return NextResponse.json({ ok: true, directJoin: true });
    } else {
      // Fallback to invite flow for backward compatibility
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
      return NextResponse.json({ ok: true, directJoin: false });
    }
  } catch (e) {
    return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 });
  }
}
