import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ShiftTemplate from '@/models/ShiftTemplate';
import { withGuard } from '@/lib/apiGuard';

export async function POST(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      const { ids } = await req.json();
      if (!Array.isArray(ids) || ids.length < 2) {
        return NextResponse.json({ error: 'At least two ids required' }, { status: 400 });
      }
      await dbConnect();
      await (ShiftTemplate as any).deleteMany({ _id: { $in: ids }, orgId });
      return NextResponse.json({ ok: true });
    },
    ['MANAGER', 'OWNER'],
  );
}
