import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ShiftTemplate from '@/models/ShiftTemplate';
import { withGuard } from '@/lib/apiGuard';

export async function POST(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      const { sourcePositionId, targetPositionId } = await req.json();
      if (!sourcePositionId || !targetPositionId) {
        return NextResponse.json(
          { error: 'sourcePositionId and targetPositionId are required' },
          { status: 400 },
        );
      }
      if (String(sourcePositionId) === String(targetPositionId)) {
        return NextResponse.json({ error: 'Source and target must differ' }, { status: 400 });
      }
      await dbConnect();
      const source = await (ShiftTemplate as any).find({ orgId, positionId: sourcePositionId });
      if (source.length === 0) return NextResponse.json({ ok: true, created: 0, skipped: 0 });
      const existing = await (ShiftTemplate as any).find({ orgId, positionId: targetPositionId });
      const existingKeys = new Set(
        existing.map((t: any) => `${t.dayOfWeek}|${t.start}|${t.end}|${t.requiredCount}`),
      );
      const docs = source
        .filter(
          (t: any) => !existingKeys.has(`${t.dayOfWeek}|${t.start}|${t.end}|${t.requiredCount}`),
        )
        .map((t: any) => ({
          orgId,
          positionId: targetPositionId,
          dayOfWeek: t.dayOfWeek,
          start: t.start,
          end: t.end,
          requiredCount: t.requiredCount,
        }));
      if (docs.length > 0) {
        await (ShiftTemplate as any).insertMany(docs);
      }
      return NextResponse.json({
        ok: true,
        created: docs.length,
        skipped: source.length - docs.length,
      });
    },
    ['MANAGER', 'OWNER'],
  );
}
