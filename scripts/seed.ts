// npx ts-node apps/web/scripts/seed.ts
import mongoose from 'mongoose';
import Org from '@/models/Org';
import User from '@/models/User';
import Position from '@/models/Position';
import ShiftTemplate from '@/models/ShiftTemplate';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextshyft';
const ORG_NAME = process.env.SEED_ORG_NAME || 'Demo Bar & Grill';
const ORG_ID = process.env.SEED_ORG_ID || new mongoose.Types.ObjectId().toString();

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

  const org = await (Org as any).create({
    _id: ORG_ID,
    name: ORG_NAME,
    plan: 'pro',
    signupCode: 'DEMO01',
  });

  // Positions
  const posDocs = await Promise.all(
    positions.map((name) => (Position as any).create({ orgId: ORG_ID, name })),
  );
  const posMap = Object.fromEntries(posDocs.map((p: any) => [p.name, p._id.toString()]));

  // Users
  for (const s of staff) {
    await (User as any).create({
      orgId: ORG_ID,
      email: s.email,
      name: s.name,
      roles: ['EMPLOYEE'],
      positions: [posMap['Server']],
    });
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
    await (Availability as any).create({ orgId: ORG_ID, userEmail: s.email, weekly });
  }

  // Org policy
  await (OrgPolicy as any).create({
    orgId: ORG_ID,
    maxHoursPerDay: 10,
    minRestHours: 10,
    reqBreakMins: 30,
  });

  // Coverage templates: Server needs 2 from 17-23 Fri/Sat
  for (const dow of ['fri', 'sat']) {
    for (let h = 17; h < 23; h++) {
      await (ShiftTemplate as any).create({
        orgId: ORG_ID,
        positionId: posMap['Server'],
        dayOfWeek: dow,
        start: `${String(h).padStart(2, '0')}:00`,
        end: `${String(h + 1).padStart(2, '0')}:00`,
        requiredCount: 2,
      });
    }
  }

  console.log('Seed complete.');
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
