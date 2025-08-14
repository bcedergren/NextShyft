import { requireOwner } from '@/lib/authorize';
import { requireManager } from '@/lib/authorize';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({});
  await dbConnect();
  const org = await (Org as any).findById((session as any).orgId);
  return NextResponse.json(org || {});
}

export async function PUT(req: Request) {
  const ownerGuard = await requireOwner({ allowWhenSuspended: true });
  if (!ownerGuard.ok)
    return NextResponse.json({ error: ownerGuard.message }, { status: ownerGuard.status });
  const managerGuard = await requireManager();
  if (!managerGuard.ok)
    return NextResponse.json({ error: managerGuard.message }, { status: managerGuard.status });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await req.json();
  const org = await (Org as any).findByIdAndUpdate(
    (session as any).orgId,
    { $set: body },
    { new: true, upsert: true },
  );
  return NextResponse.json(org);
}
