import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { Resend } from 'resend';
import { rateLimit } from '@/lib/rateLimit';
import { resetPasswordEmail } from '@/lib/emailTemplates';

function token() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
}

export async function POST(req: NextRequest) {
  // Tight per-IP limit specifically for forgot-password to reduce abuse
  const { ok: allowed, headers } = await rateLimit(req, 3, 15 * 60_000);
  if (!allowed) {
    // Do not reveal anything; just respond OK with rate-limit headers
    return NextResponse.json({ ok: true }, { headers });
  }
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  await dbConnect();
  const lower = String(email).toLowerCase();
  const user: any = await (User as any).findOne({ email: lower });
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
        to: lower,
        subject: 'Reset your password',
        html: await resetPasswordEmail(url),
      });
    }
  }
  // Always return ok to avoid leaking which emails exist
  return NextResponse.json({ ok: true }, { headers });
}
