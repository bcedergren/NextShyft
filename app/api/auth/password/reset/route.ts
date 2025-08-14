import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import crypto from 'crypto';

function hashPassword(pwd: string) {
  return crypto.createHash('sha256').update(pwd).digest('hex');
}

export async function POST(req: Request) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: 'Bad request' }, { status: 400 });
  await dbConnect();
  const user: any = await (User as any).findOne({ 'reset.token': token });
  if (!user || !user.reset?.expiresAt || new Date(user.reset.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }
  user.passwordHash = hashPassword(password);
  user.reset = { token: '', expiresAt: null } as any;
  await user.save();
  return NextResponse.json({ ok: true });
}
