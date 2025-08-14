// @ts-nocheck
// npx ts-node scripts/seed-metrics.ts
import mongoose from 'mongoose';
import Org from '@/models/Org';
import User from '@/models/User';
import Schedule from '@/models/Schedule';
import Notification from '@/models/Notification';
import Swap from '@/models/Swap';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextshyft';

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]) {
  return arr[randInt(0, arr.length - 1)];
}

const ORG_NAMES = [
  'Bluebird Bar',
  'Cedar & Stone',
  'Harbor House',
  'Night Owl',
  'Sunset Lounge',
  'Rivertown Diner',
  'Copper Spoon',
  'Atlas Taproom',
  'The Greenhouse',
  'The Hideout',
];

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');

  const orgIds: string[] = [];
  for (const name of ORG_NAMES) {
    const org = await Org.create({
      name,
      plan: pick(['free', 'pro', 'business']),
      signupCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    });
    orgIds.push(String(org._id));

    // Users 5-40
    const userCount = randInt(5, 40);
    for (let i = 0; i < userCount; i++) {
      await User.create({
        orgId: String(org._id),
        email: `user${i}_${name.replace(/\s/g, '').toLowerCase()}@example.com`,
        name: `User ${i}`,
        roles: ['EMPLOYEE'],
      });
    }

    // Schedules 2-12
    const scheds = randInt(2, 12);
    for (let s = 0; s < scheds; s++) {
      await Schedule.create({
        orgId: String(org._id),
        periodStart: new Date(Date.now() - randInt(1, 60) * 86400000),
        periodEnd: new Date(),
      });
    }

    // Notifications 20-200
    const notifCount = randInt(20, 200);
    const users = await User.find({ orgId: String(org._id) }).select('email');
    for (let n = 0; n < notifCount; n++) {
      const u = pick(users);
      await Notification.create({
        orgId: String(org._id),
        userEmail: u.email,
        type: pick(['ANNOUNCEMENT', 'SCHEDULE_PUBLISHED', 'SWAP_APPROVED']),
        title: 'Event',
        body: '...',
      });
    }

    // Swaps 0-50
    const swaps = randInt(0, 50);
    for (let w = 0; w < swaps; w++) {
      await Swap.create({
        orgId: String(org._id),
        status: pick(['PENDING', 'APPROVED', 'DENIED']),
      });
    }
  }

  console.log('Seeded orgs:', orgIds.length);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
