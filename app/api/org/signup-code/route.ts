import { requireManager } from '@/lib/authorize';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';

function genCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export async function POST() {
  const guard = await requireManager();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const org = await (Org as any).findByIdAndUpdate(
    (session as any).orgId,
    { $set: { signupCode: genCode() } },
    { new: true, upsert: true },
  );
  return NextResponse.json({ signupCode: org.signupCode });
}
