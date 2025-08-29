// npx tsx scripts/seed.ts
/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose, { Types } from 'mongoose';
import Org from '@/models/Org';
import User from '@/models/User';
import Position from '@/models/Position';
import ShiftTemplate from '@/models/ShiftTemplate';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';
import crypto from 'crypto';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  (process.env as any).MongoDB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  'mongodb://127.0.0.1:27017/nextshyft';
const ORG_NAME = process.env.SEED_ORG_NAME || 'Demo Bar & Grill';
const ORG_ID = process.env.SEED_ORG_ID || new Types.ObjectId().toString();

const staff = [
  { name: 'Alex Rivera', email: 'alex@example.com' },
  { name: 'Jordan Lee', email: 'jordan@example.com' },
  { name: 'Sam Patel', email: 'sam@example.com' },
  { name: 'Taylor Kim', email: 'taylor@example.com' },
  { name: 'Riley Chen', email: 'riley@example.com' },
];

const positions = ['Bartender', 'Server', 'Host', 'Barback'];

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // Org: upsert by _id (or name if needed)
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
  }

  // Positions
  const posDocs: any[] = [];
  for (const name of positions) {
    let p = await (Position as any).findOne({ orgId: ORG_ID, name });
    if (!p) p = await (Position as any).create({ orgId: ORG_ID, name });
    posDocs.push(p);
  }
  const posMap = Object.fromEntries(posDocs.map((p: any) => [p.name, p._id.toString()]));

  // Users: assign each to a position (rotate across created positions)
  for (let i = 0; i < staff.length; i++) {
    const s = staff[i];
    const password = 'password123';
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    const posName = positions[i % positions.length];
    const positionId = posMap[posName];
    const existing = await (User as any).findOne({ orgId: ORG_ID, email: s.email });
    if (existing) {
      await (User as any).updateOne(
        { _id: existing._id },
        {
          $set: {
            name: s.name,
            roles: existing.roles?.length ? existing.roles : ['EMPLOYEE'],
            passwordHash: existing.passwordHash || hash,
          },
          $addToSet: { positions: positionId },
        },
      );
    } else {
      await (User as any).create({
        orgId: ORG_ID,
        email: s.email,
        name: s.name,
        roles: ['EMPLOYEE'],
        positions: [positionId],
        passwordHash: hash,
      });
    }
  }

  // Availability: Mon-Fri 10-22 for all
  const weekly: any = {
    mon: [{ start: '10:00', end: '22:00' }],
    tue: [{ start: '10:00', end: '22:00' }],
    wed: [{ start: '10:00', end: '22:00' }],
    thu: [{ start: '10:00', end: '22:00' }],
    fri: [{ start: '10:00', end: '22:00' }],
    sat: [],
    sun: [],
  };
  for (const s of staff) {
    const exists = await (Availability as any).findOne({ orgId: ORG_ID, userEmail: s.email });
    if (!exists) await (Availability as any).create({ orgId: ORG_ID, userEmail: s.email, weekly });
  }

  // Org policy
  const existingPolicy = await (OrgPolicy as any).findOne({ orgId: ORG_ID });
  if (!existingPolicy) {
    await (OrgPolicy as any).create({
      orgId: ORG_ID,
      maxHoursPerDay: 10,
      minRestHours: 10,
      reqBreakMins: 30,
    });
  }

  // Coverage templates: Server needs 2 from 17-23 Fri/Sat
  for (const dow of ['fri', 'sat']) {
    for (let h = 17; h < 23; h++) {
      const doc = {
        orgId: ORG_ID,
        positionId: posMap['Server'],
        dayOfWeek: dow,
        start: `${String(h).padStart(2, '0')}:00`,
        end: `${String(h + 1).padStart(2, '0')}:00`,
        requiredCount: 2,
      } as any;
      const exists = await (ShiftTemplate as any).findOne(doc);
      if (!exists) await (ShiftTemplate as any).create(doc);
    }
  }

  console.log('Seed complete.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
