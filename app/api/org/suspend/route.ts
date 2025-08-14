import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireOwner } from '@/lib/authorize';
import Org from '@/models/Org';

export async function PUT(req: Request) {
  const guard = await requireOwner({ allowWhenSuspended: true });
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  const session = guard.session as any;
  await dbConnect();
  const { suspended } = await req.json();
  // Owners may only UNSUSPEND; suspension is super-admin only
  if (suspended === true)
    return NextResponse.json({ error: 'Owners cannot suspend their org' }, { status: 403 });
  const org = await (Org as any).findByIdAndUpdate(
    session.orgId,
    { $set: { suspended: false }, $unset: { suspendedAt: 1 } },
    { new: true },
  );
  return NextResponse.json({ ok: true, suspended: org?.suspended === true });
}
