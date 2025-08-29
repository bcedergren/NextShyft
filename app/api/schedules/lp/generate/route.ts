import { SchedulerService } from '@/services/SchedulerService';
import { ScheduleRepository } from '@/repositories/ScheduleRepository';
import { ShiftRepository } from '@/repositories/ShiftRepository';
import { UserRepository } from '@/repositories/UserRepository';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildLP } from '@/lib/scheduler/encode';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import Schedule from '@/models/Schedule';
import User from '@/models/User';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';
import Audit from '@/models/Audit';

const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export async function POST(req: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId || '';
  let includeManagers = false;
  try {
    const body = await req.json();
    includeManagers = !!body?.includeManagers;
  } catch {}
  const service = new SchedulerService(
    new ScheduleRepository(),
    new ShiftRepository(),
    new UserRepository(),
  );
  // Use the orgId from the latest schedule to avoid ObjectId cast errors
  const result = await service.generateForLatestOrg(orgId, { includeManagers });
  return NextResponse.json(result);
}
