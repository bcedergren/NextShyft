import { SchedulerService } from '@/services/SchedulerService';
import { ScheduleRepository } from '@/repositories/ScheduleRepository';
import { ShiftRepository } from '@/repositories/ShiftRepository';
import { UserRepository } from '@/repositories/UserRepository';

import { NextResponse } from 'next/server';
import { buildLP } from '@/lib/scheduler/encode';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import Schedule from '@/models/Schedule';
import User from '@/models/User';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';
import Audit from '@/models/Audit';

const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export async function POST() {
  const service = new SchedulerService(
    new ScheduleRepository(),
    new ShiftRepository(),
    new UserRepository(),
  );
  // Use the orgId from the latest schedule to avoid ObjectId cast errors
  const result = await service.generateForLatestOrg();
  return NextResponse.json(result);
}
