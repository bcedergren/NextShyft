import { NextResponse } from 'next/server';
import { withGuard } from '@/lib/apiGuard';
import { dbConnect } from '@/lib/db';
import ShiftTemplate from '@/models/ShiftTemplate';
import CoverageTemplate from '@/models/CoverageTemplate';

const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// GET ?positionId=.. -> grid[7][24]
export async function GET(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      const url = new URL(req.url);
      const positionId = url.searchParams.get('positionId');
      if (!positionId) return NextResponse.json({ error: 'positionId required' }, { status: 400 });
      await dbConnect();
      // Read from coverage templates if present; fall back to shift templates for backward compat
      const rows = await (CoverageTemplate as any)
        .find({ orgId, positionId })
        .then((r: any[]) => (r.length ? r : (ShiftTemplate as any).find({ orgId, positionId })));
      const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
      for (const r of rows) {
        const d = days.indexOf(r.dayOfWeek);
        const start = parseInt(String(r.start).split(':')[0], 10);
        const end = parseInt(String(r.end).split(':')[0], 10);
        for (let h = start; h < end; h++) grid[d][h] = Math.max(grid[d][h], r.requiredCount);
      }
      return NextResponse.json({ grid });
    },
    ['MANAGER', 'OWNER'],
  );
}

// PUT { positionId, grid } -> writes ShiftTemplates; naive approach: replace all entries for that position
export async function PUT(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      const body = await req.json();
      const { positionId, grid } = body;
      if (!positionId || !Array.isArray(grid) || grid.length !== 7)
        return NextResponse.json({ error: 'Bad payload' }, { status: 400 });
      await dbConnect();
      // Write coverage templates; also add any missing shift templates additively (never delete)
      await CoverageTemplate.deleteMany({ orgId, positionId });
      const createdBlocks: Array<{
        dayOfWeek: string;
        start: string;
        end: string;
        requiredCount: number;
      }> = [];
      for (let d = 0; d < 7; d++) {
        let h = 0;
        while (h < 24) {
          const reqd = Number(grid[d][h] || 0);
          if (!reqd) {
            h++;
            continue;
          }
          // Merge contiguous hours with the same required count into a single template
          let endHour = h + 1;
          while (endHour < 24 && Number(grid[d][endHour] || 0) === reqd) endHour++;
          const start = `${String(h).padStart(2, '0')}:00`;
          const end = `${String(endHour).padStart(2, '0')}:00`;
          await (CoverageTemplate as any).create({
            orgId,
            positionId,
            dayOfWeek: days[d],
            start,
            end,
            requiredCount: reqd,
          });
          createdBlocks.push({ dayOfWeek: days[d], start, end, requiredCount: reqd });
          h = endHour;
        }
      }
      // Add missing shift templates for these coverage blocks (AM/PM etc.) without removing existing templates
      for (const blk of createdBlocks) {
        const exists = await (ShiftTemplate as any).findOne({
          orgId,
          positionId,
          dayOfWeek: blk.dayOfWeek,
          start: blk.start,
          end: blk.end,
        });
        if (!exists) {
          await (ShiftTemplate as any).create({
            orgId,
            positionId,
            dayOfWeek: blk.dayOfWeek,
            start: blk.start,
            end: blk.end,
            requiredCount: blk.requiredCount,
          });
        }
      }
      return NextResponse.json({ ok: true });
    },
    ['MANAGER', 'OWNER'],
  );
}
