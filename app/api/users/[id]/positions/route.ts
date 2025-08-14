import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const { positionIds } = await req.json();
  if (!Array.isArray(positionIds)) {
    return NextResponse.json({ error: 'positionIds array required' }, { status: 400 });
  }
  const dedup = Array.from(new Set(positionIds.map(String)));
  const updated = await (User as any).findOneAndUpdate(
    { _id: params.id, orgId },
    { $set: { positions: dedup } },
    { new: true },
  );
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, user: updated });
}
