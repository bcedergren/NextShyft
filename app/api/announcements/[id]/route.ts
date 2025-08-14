import { NextResponse } from 'next/server';
import { requireManager } from '@/lib/authorize';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireManager();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  const roles = (((guard.session as any).user as any)?.roles || []) as string[];
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const orgId = (guard.session as any).orgId;
  await dbConnect();
  const filter = isSuperAdmin ? { _id: params.id } : { _id: params.id, orgId };
  await (Announcement as any).deleteOne(filter);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireManager();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  const roles = (((guard.session as any).user as any)?.roles || []) as string[];
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const orgId = (guard.session as any).orgId;
  await dbConnect();
  const updates = await req.json();
  const filter = isSuperAdmin ? { _id: params.id } : { _id: params.id, orgId };
  await (Announcement as any).updateOne(filter, { $set: updates });
  return NextResponse.json({ ok: true });
}
