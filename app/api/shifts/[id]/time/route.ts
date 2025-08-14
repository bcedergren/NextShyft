import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const body = await req.json();
  const start = String(body?.start || '');
  const end = String(body?.end || '');
  if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
    return NextResponse.json({ error: 'Invalid time format' }, { status: 400 });
  }
  const doc = await (Shift as any).findById(params.id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  doc.start = start;
  doc.end = end;
  await doc.save();
  return NextResponse.json({ ok: true, shift: doc });
}
