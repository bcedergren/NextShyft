// npx ts-node apps/web/scripts/seed-dashboard.ts
/* eslint-disable no-console */
import 'dotenv/config';
import mongoose from 'mongoose';
import Org from '@/models/Org';
import User from '@/models/User';
import Position from '@/models/Position';
import Schedule from '@/models/Schedule';
import Shift from '@/models/Shift';
import Announcement from '@/models/Announcement';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  'mongodb://127.0.0.1:27017/nextshyft';
const ORG_NAME = process.env.SEED_ORG_NAME || 'Demo Bar & Grill';
const ORG_ID = process.env.SEED_ORG_ID || new mongoose.Types.ObjectId().toString();
const EMPLOYEE_EMAIL =
  process.env.SEED_EMPLOYEE_EMAIL || process.env.TEST_EMAIL || 'employee@example.com';

async function ensureOrg(): Promise<any> {
  let org = await (Org as any).findOne({ _id: ORG_ID });
  if (!org) {
    org = await (Org as any).findOne({ name: ORG_NAME });
  }
  if (!org) {
    org = await (Org as any).create({
      _id: ORG_ID,
      name: ORG_NAME,
      plan: 'pro',
      signupCode: 'DEMO01',
    });
    console.log('Created org', org._id.toString());
  } else {
    console.log('Using org', org._id.toString());
  }
  return org;
}

async function ensurePosition(orgId: string, name: string): Promise<any> {
  let pos = await (Position as any).findOne({ orgId, name });
  if (!pos) pos = await (Position as any).create({ orgId, name });
  return pos;
}

async function ensureEmployee(orgId: string, email: string, positionId: string): Promise<any> {
  let user = await (User as any).findOne({ email });
  if (!user) {
    user = await (User as any).create({
      orgId,
      email,
      name: email.split('@')[0],
      roles: ['EMPLOYEE'],
      positions: [positionId],
    });
    console.log('Created user', user._id.toString());
  } else {
    console.log('Using user', user._id.toString());
  }
  return user;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun
  const diff = day; // days since Sunday
  x.setDate(x.getDate() - diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfWeek(d: Date) {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

async function seedAnnouncements(orgId: string) {
  const existing = await (Announcement as any).find({ orgId }).limit(1);
  if (existing.length > 0) {
    console.log('Announcements already present');
    return;
  }
  await (Announcement as any).create([
    {
      orgId,
      title: 'Welcome to NextShyft',
      body: 'Your schedule and hours are now easier to find.',
    },
    {
      orgId,
      title: 'New swap feature',
      body: 'Request a swap from your schedule card.',
      pinned: true,
    },
  ]);
  console.log('Seeded announcements');
}

async function seedShifts(orgId: string, userId: string, positionId: string) {
  const today = new Date();
  const sow = startOfWeek(today);
  const eow = endOfWeek(today);
  // Ensure schedule for this week
  let sched = await (Schedule as any).findOne({
    orgId,
    periodStart: { $lte: today },
    periodEnd: { $gte: today },
  });
  if (!sched) {
    sched = await (Schedule as any).create({
      orgId,
      periodStart: sow,
      periodEnd: eow,
      status: 'published',
    });
    console.log('Created schedule', sched._id.toString());
  }
  // Create a few shifts across the week including today
  const days: number[] = [0, 1, 3]; // Sun, Mon, Wed relative to start of week
  const docs: any[] = [];
  for (const offset of days) {
    const d = new Date(sow);
    d.setDate(sow.getDate() + offset);
    // One shift per day 17:00-23:00 assigned to employee
    docs.push({
      orgId,
      scheduleId: sched._id,
      date: d,
      positionId,
      start: '17:00',
      end: '23:00',
      requiredCount: 1,
      assignments: [{ userId }],
    });
  }
  await (Shift as any).insertMany(docs);
  console.log('Seeded shifts:', docs.length);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');
  const org = await ensureOrg();
  const serverPos = await ensurePosition(org._id, 'Server');
  const user = await ensureEmployee(org._id, EMPLOYEE_EMAIL, serverPos._id);
  await seedAnnouncements(org._id);
  await seedShifts(org._id, user._id, serverPos._id);
  await mongoose.disconnect();
  console.log('Seed complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
