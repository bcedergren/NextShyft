import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ShiftTemplate from '@/models/ShiftTemplate';
import { withGuard } from '@/lib/apiGuard';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  return withGuard(
    req,
    async ({ orgId }) => {
      await dbConnect();
      const body = await req.json();
      const update: any = {};
      for (const k of ['positionId', 'dayOfWeek', 'start', 'end', 'requiredCount']) {
        if (k in body) update[k] = body[k];
      }
      await (ShiftTemplate as any).updateOne({ _id: params.id, orgId }, { $set: update });
      const doc = await (ShiftTemplate as any).findOne({ _id: params.id, orgId });
      if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(doc);
    },
    ['MANAGER', 'OWNER'],
  );
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  return withGuard(
    req,
    async ({ orgId }) => {
      await dbConnect();
      await (ShiftTemplate as any).deleteOne({ _id: params.id, orgId });
      return NextResponse.json({ ok: true });
    },
    ['MANAGER', 'OWNER'],
  );
}
