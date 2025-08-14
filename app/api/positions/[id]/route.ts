import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Position from '@/models/Position';
import ShiftTemplate from '@/models/ShiftTemplate';
import Shift from '@/models/Shift';
import { withGuard } from '@/lib/apiGuard';
import { requireOwner } from '@/lib/authorize';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return withGuard(
    req,
    async ({ orgId }) => {
      await dbConnect();
      const body = await req.json();
      const update: any = {};
      for (const k of ['name']) if (k in body) update[k] = body[k];
      await (Position as any).updateOne({ _id: params.id, orgId }, { $set: update });
      const doc = await (Position as any).findOne({ _id: params.id, orgId });
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(doc);
    },
    ['MANAGER', 'OWNER'],
  );
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireOwner();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  const orgId = (guard.session as any).orgId;
  await dbConnect();
  const inTemplates = await (ShiftTemplate as any).countDocuments({
    orgId,
    positionId: params.id,
  });
  const inShifts = await (Shift as any).countDocuments({ orgId, positionId: params.id });
  if (inTemplates || inShifts) {
    return NextResponse.json({ error: 'Position in use by templates or shifts' }, { status: 400 });
  }
  await (Position as any).deleteOne({ _id: params.id, orgId });
  return NextResponse.json({ ok: true });
}
