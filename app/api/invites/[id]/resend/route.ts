import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Invite from '@/models/Invite';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { inviteEmail } from '@/lib/emailTemplates';
import { Resend } from 'resend';
import { auditService } from '@/lib/di';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const actorEmail = (session as any).user?.email;
  await dbConnect();

  const invite = await (Invite as any).findOne({ _id: params.id, orgId });
  if (!invite) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (invite.status !== 'PENDING') {
    return NextResponse.json({ error: 'Only PENDING invites can be resent' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
  if (apiKey) {
    const resend = new Resend(apiKey);
    const link = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/accept?token=${invite.token}`;
    await resend.emails.send({
      from,
      to: invite.email,
      subject: "You're invited to NextShyft",
      html: inviteEmail(link),
    });
  }

  await auditService.log(orgId, actorEmail, 'INVITE_RESENT', { email: invite.email });
  return NextResponse.json({ ok: true });
}
