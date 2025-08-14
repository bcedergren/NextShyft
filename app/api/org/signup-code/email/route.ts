import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import { Resend } from 'resend';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  await dbConnect();
  const orgId = (session as any).orgId;
  const org: any = await (Org as any).findById(orgId).select('name signupCode');
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
  if (!apiKey)
    return NextResponse.json({ error: 'Email not configured on server' }, { status: 400 });
  try {
    const resend = new Resend(apiKey);
    const joinUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/join`;
    await resend.emails.send({
      from,
      to: email,
      subject: `Join ${org?.name || 'your organization'} on NextShyft`,
      html: `<p>Use this signup code to join: <b>${org?.signupCode || ''}</b></p><p>Go to <a href="${joinUrl}">${joinUrl}</a> to enter the code.</p>`,
    });
    return NextResponse.json({ ok: true, sent: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to send email' }, { status: 500 });
  }
}
