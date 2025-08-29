import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import User from '@/models/User';
import Availability from '@/models/Availability';
import { Types } from 'mongoose';

function hhmmToMinutes(t: string | null | undefined): number | null {
  if (!t || typeof t !== 'string') return null;
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  if (isNaN(h) || isNaN(min)) return null;
  return h * 60 + min;
}

function isContained(outerStart: number, outerEnd: number, innerStart: number, innerEnd: number) {
  return outerStart <= innerStart && outerEnd >= innerEnd;
}

export async function PUT(req: Request) {
  const { shiftId, staffId, staffIds } = await req.json();
  await dbConnect();
  const shift = await (Shift as any).findById(shiftId);
  if (!shift) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  let desiredIds: string[] = [];
  if (Array.isArray(staffIds)) desiredIds = staffIds.map(String);
  else if (staffId) {
    const set = new Set([...shift.assignments.map((a: any) => String(a.userId)), String(staffId)]);
    desiredIds = Array.from(set);
  } else {
    return NextResponse.json({ error: 'No assignments provided' }, { status: 400 });
  }

  // Availability gate: allow only staff whose availability covers the shift hours
  const shiftDate = new Date(shift.date);
  const dateKey = new Date(
    Date.UTC(shiftDate.getFullYear(), shiftDate.getMonth(), shiftDate.getDate()),
  )
    .toISOString()
    .slice(0, 10);
  const dowNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  const dow = dowNames[shiftDate.getDay()];
  const sStart = hhmmToMinutes(shift.start);
  const sEnd = hhmmToMinutes(shift.end);
  const orgIdStr = String((shift as any).orgId || '');

  const availableIds: string[] = [];
  const skipped: Array<{ id: string; reason: string }> = [];

  const shiftPosId = String((shift as any).positionId || '');
  for (const id of desiredIds) {
    // Resolve user and email by id or email
    let email = '';
    let userDoc: any = null;
    if (Types.ObjectId.isValid(id)) {
      userDoc = await (User as any).findById(id).select('email positions');
      email = userDoc?.email || '';
    } else {
      userDoc = await (User as any).findOne({ email: id }).select('email positions');
      email = userDoc?.email || '';
    }
    if (!email || sStart == null || sEnd == null) {
      availableIds.push(id); // if we can't determine, default allow
      continue;
    }
    // Position gate: must hold the shift's position
    const hasPosition = (() => {
      if (!userDoc) return false;
      const list = Array.isArray(userDoc.positions) ? userDoc.positions : [];
      return list.some((p: any) => String(p?.toString?.() || p?._id || p) === shiftPosId);
    })();
    if (!hasPosition) {
      skipped.push({ id, reason: 'position_mismatch' });
      continue;
    }
    const avail = await (Availability as any).findOne({
      orgId: orgIdStr || undefined,
      userEmail: email,
    });
    if (!avail) {
      availableIds.push(id); // no record, allow
      continue;
    }
    const dayBlocks = (avail.weekly?.[dow] as any[]) || [];
    const dateBlocks = (avail.dates?.get?.(dateKey) as any[]) || [];
    const blocks: Array<{ start: string; end: string; prefer?: boolean }> = [
      ...dateBlocks,
      ...dayBlocks,
    ];
    const ok = blocks.some((b) => {
      const a = hhmmToMinutes((b as any).start);
      const e = hhmmToMinutes((b as any).end);
      if (a == null || e == null) return false;
      // Only consider blocks that fully contain the shift window
      return isContained(a, e, sStart, sEnd);
    });
    if (ok) availableIds.push(id);
    else skipped.push({ id, reason: 'unavailable' });
  }

  shift.assignments = availableIds.map((u) => ({ userId: u }));
  await shift.save();
  return NextResponse.json({ ok: true, assigned: availableIds, skipped });
}
