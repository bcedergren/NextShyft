import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Availability from '@/models/Availability';
import { getRequestContext } from '@/lib/requestContext';

export async function GET() {
  const { session, isAuthed } = await getRequestContext();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const userEmail = (session!.user as any)?.email;
  await dbConnect();
  const doc = await (Availability as any).findOne({ orgId, userEmail });
  return NextResponse.json(doc || { weekly: {}, dates: {}, notes: {} });
}

export async function PUT(req: Request) {
  const { session, isAuthed } = await getRequestContext();
  if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const userEmail = (session!.user as any)?.email;
  await dbConnect();
  const data = await req.json();
  const update: any = { $set: {} };
  if (Object.prototype.hasOwnProperty.call(data, 'weekly')) update.$set.weekly = data.weekly;
  if (Object.prototype.hasOwnProperty.call(data, 'dates')) update.$set.dates = data.dates || {};
  if (Object.prototype.hasOwnProperty.call(data, 'notes')) update.$set.notes = data.notes || {};
  const doc = await (Availability as any).findOneAndUpdate({ orgId, userEmail }, update, {
    upsert: true,
    new: true,
  });
  return NextResponse.json(doc);
}
