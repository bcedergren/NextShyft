import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Types } from 'mongoose';

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
  if (!session) return NextResponse.json([], { status: 401 });
  const url = new URL(req.url);
  const scheduleId = url.searchParams.get('scheduleId');
  const positionId = url.searchParams.get('positionId');
  await dbConnect();
  const query: any = {};
  if (scheduleId) {
    query.scheduleId = Types.ObjectId.isValid(scheduleId)
      ? new Types.ObjectId(scheduleId)
      : scheduleId;
  }
  if (positionId) {
    query.positionId = Types.ObjectId.isValid(positionId)
      ? new Types.ObjectId(positionId)
      : positionId;
  }
  const items = await (Shift as any).find(query).sort({ date: 1, start: 1 });
  return NextResponse.json(items);
}
