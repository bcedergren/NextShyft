import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Schedule from '@/models/Schedule';
import Shift from '@/models/Shift';

export async function GET(req: Request) {
  let session: any = await getServerSession(authOptions);
  if (!session) {
    const cookie = req.headers.get('cookie') || '';
    const demoMatch = /__demosession=([^;]+)/.exec(cookie);
    const mockMatch = /__mocksession=([^;]+)/.exec(cookie);
    if (demoMatch && mockMatch) {
      try {
        const mock = JSON.parse(decodeURIComponent(mockMatch[1]));
        session = { orgId: mock?.orgId || '' } as any;
      } catch {}
    }
  }
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const schedule = await (Schedule as any).findOne({ orgId }).sort({ createdAt: -1 });
  if (!schedule) return NextResponse.json({ hasUnpublishedChanges: false, publishedAt: null });

  let hasUnpublishedChanges = false;
  if (schedule.publishedAt) {
    const newerShift = await (Shift as any)
      .findOne({ scheduleId: schedule._id, updatedAt: { $gt: schedule.publishedAt } })
      .select({ _id: 1 })
      .lean();
    hasUnpublishedChanges = !!newerShift;
  } else {
    hasUnpublishedChanges = true;
  }

  return NextResponse.json({
    scheduleId: String(schedule._id),
    status: schedule.status,
    publishedAt: schedule.publishedAt || null,
    hasUnpublishedChanges,
  });
}
