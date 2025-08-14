import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = (session.user as any)?.email;
  const { code } = await req.json();
  if (typeof code !== 'string' || !code.trim()) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 400 });
  }
  await dbConnect();
  const doc: any = await (User as any).findOne({ email }).select('phoneVerification');
  const pv = doc?.phoneVerification;
  if (!pv || !pv.code || !pv.expiresAt) {
    return NextResponse.json({ error: 'No verification in progress' }, { status: 400 });
  }
  if (new Date(pv.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Code expired' }, { status: 400 });
  }
  if (pv.code !== code.trim()) {
    return NextResponse.json({ error: 'Incorrect code' }, { status: 400 });
  }
  await (User as any).updateOne(
    { email },
    { $set: { phoneVerified: true }, $unset: { phoneVerification: 1 } },
  );
  return NextResponse.json({ ok: true });
}
