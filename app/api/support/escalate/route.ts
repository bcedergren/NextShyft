import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import { Resend } from 'resend';
import { supportEscalationEmail } from '@/lib/emailTemplates';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const org = await (Org as any).findById((session as any).orgId).select('name plan');
  const to = process.env.SUPPORT_EMAIL || 'support@nextshyft.app';
  if (!process.env.RESEND_API_KEY)
    return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 400 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const html = supportEscalationEmail(
    org?.name || 'Unknown',
    String((session as any).orgId || ''),
    (session.user as any)?.email || '',
    org?.plan || 'pro',
  );
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'noreply@nextshyft.app',
    to,
    subject: 'Escalation: Suspended Org Assist',
    html,
  });
  return NextResponse.json({ ok: true });
}
