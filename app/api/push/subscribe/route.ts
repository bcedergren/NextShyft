import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import PushSubscription from '@/models/PushSubscription';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = (session.user as any)?.email;
  await dbConnect();
  const body = await req.json();
  await (PushSubscription as any).findOneAndUpdate(
    { userEmail: email },
    { $set: { orgId: (session as any).orgId, userEmail: email, subscription: body } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
