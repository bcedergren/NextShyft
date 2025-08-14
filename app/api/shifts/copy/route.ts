import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  await dbConnect();
  const orig: any = await (Shift as any).findById(id);
  if (!orig) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const copy = new (Shift as any)({
    orgId: orig.orgId,
    scheduleId: orig.scheduleId,
    date: orig.date,
    positionId: orig.positionId,
    start: orig.start,
    end: orig.end,
    requiredCount: orig.requiredCount,
    assignments: [],
    notes: orig.notes,
  });
  await copy.save();
  return NextResponse.json(copy);
}
