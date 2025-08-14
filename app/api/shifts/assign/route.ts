import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';

export async function PUT(req: Request) {
  const { shiftId, staffId, staffIds } = await req.json();
  await dbConnect();
  const shift = await (Shift as any).findById(shiftId);
  if (!shift) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  let ids: string[] = [];
  if (Array.isArray(staffIds)) ids = staffIds;
  else if (staffId) {
    const set = new Set([...shift.assignments.map((a: any) => String(a.userId)), String(staffId)]);
    ids = Array.from(set);
  } else {
    return NextResponse.json({ error: 'No assignments provided' }, { status: 400 });
  }
  shift.assignments = ids.map((u) => ({ userId: u }));
  await shift.save();
  return NextResponse.json({ ok: true });
}
