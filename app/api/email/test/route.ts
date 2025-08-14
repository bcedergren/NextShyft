
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error:'Unauthorized' }, { status: 401 });
  if (!process.env.RESEND_API_KEY) return NextResponse.json({ error:'RESEND_API_KEY missing' }, { status: 400 });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const to = (session.user as any)?.email || 'you@example.com';
  const link = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const html = `<h3>NextShyft test email</h3><p>If you can read this, email is working.</p><p><a href="${link}">${link}</a></p>`;
  await resend.emails.send({ from: process.env.EMAIL_FROM || 'noreply@nextshyft.app', to, subject: 'Test email from NextShyft', html });
  return NextResponse.json({ ok: true, to });
}
