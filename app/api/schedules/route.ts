import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Schedule from '@/models/Schedule';
import Shift from '@/models/Shift';
import ShiftTemplate from '@/models/ShiftTemplate';
import CoverageTemplate from '@/models/CoverageTemplate';
import { withGuard } from '@/lib/apiGuard';

export async function GET(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      await dbConnect();
      const schedules = await (Schedule as any).find({ orgId }).sort({ createdAt: -1 }).limit(10);
      return NextResponse.json(schedules);
    },
    ['EMPLOYEE', 'MANAGER', 'OWNER'],
  );
}

export async function POST(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      const { periodStart, periodEnd } = await req.json();
      await dbConnect();
      const schedule = await (Schedule as any).create({
        orgId,
        periodStart,
        periodEnd,
        status: 'draft',
      });
      // Prefer coverage templates; if none exist for a position/day, fall back to shift templates
      const cov = await (CoverageTemplate as any).find({ orgId });
      const templates = cov.length ? cov : await (ShiftTemplate as any).find({ orgId });
      const start = new Date(periodStart);
      const end = new Date(periodEnd);
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dow = dayNames[d.getDay()];
        const todays = templates.filter((t: any) => t.dayOfWeek === dow);
        for (const t of todays) {
          await (Shift as any).create({
            orgId,
            scheduleId: schedule._id,
            date: new Date(d),
            positionId: t.positionId,
            start: t.start,
            end: t.end,
            requiredCount: t.requiredCount,
            assignments: [],
          });
        }
      }
      return NextResponse.json(schedule);
    },
    ['MANAGER', 'OWNER'],
  );
}
