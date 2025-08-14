import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Audit from '@/models/Audit';
import Org from '@/models/Org';
import User from '@/models/User';
import { limitFor } from '@/lib/planLimits';
import { inviteEmail } from '@/lib/emailTemplates';
import Invite from '@/models/Invite';
import { inviteService, auditService } from '@/lib/di';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';

function token() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();

  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  const status = url.searchParams.get('status') || '';

  const filter: any = { orgId };
  if (q) filter.email = { $regex: q, $options: 'i' };
  if (status) filter.status = status;

  const docs = await (Invite as any).find(filter).sort({ createdAt: -1 }).limit(100);
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const { email, role, firstName = '', lastName = '' } = await req.json();
  await dbConnect();
  const tok = token();
  const created = await (Invite as any).create({
    orgId,
    email,
    role,
    token: tok,
    firstName,
    lastName,
  });
  await auditService.log(orgId, (session as any).user?.email, 'INVITE_CREATED', { email, role });
  // send email via Resend
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
  if (apiKey) {
    const resend = new Resend(apiKey);
    const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/accept?token=${tok}`;
    await resend.emails.send({
      from,
      to: email,
      subject: "You're invited to NextShyft",
      html: inviteEmail(link, firstName, lastName) /* templated */,
    });
  }
  return NextResponse.json({ ok: true, invite: created });
}
