import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { Resend } from 'resend';

function token() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  await dbConnect();
  const user: any = await (User as any).findOne({ email });
  if (user) {
    const t = token();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    user.reset = { token: t, expiresAt };
    await user.save();
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
    if (apiKey) {
      const resend = new Resend(apiKey);
      const url = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset?token=${t}`;
      await resend.emails.send({
        from,
        to: email,
        subject: 'Reset your password',
        html: `<p>To reset your password, click the link below:</p><p><a href="${url}">${url}</a></p><p>This link expires in 1 hour.</p>`,
      });
    }
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}
