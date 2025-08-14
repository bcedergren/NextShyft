import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { sendSMS } from '@/lib/notify';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = (session.user as any)?.email;
  const { phone } = await req.json();
  if (typeof phone !== 'string' || !phone.trim()) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 });
  }
  const normalized = phone.trim();
  await dbConnect();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await (User as any).updateOne(
    { email },
    {
      $set: {
        phone: normalized,
        phoneVerified: false,
        phoneVerification: { code, expiresAt },
      },
    },
  );
  await sendSMS(normalized, `Your NextShyft verification code is ${code}`);
  return NextResponse.json({ ok: true });
}
