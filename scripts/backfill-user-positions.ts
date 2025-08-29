// npx tsx scripts/backfill-user-positions.ts
/* eslint-disable no-console */
import dotenv from 'dotenv';
// Load .env.local first (Next.js convention), then .env as fallback
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose from 'mongoose';
import User from '@/models/User';
import Shift from '@/models/Shift';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  // common alternative casings
  (process.env as any).MongoDB_URI ||
  'mongodb://127.0.0.1:27017/nextshyft';

async function backfill(orgId?: string) {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  const userQuery: any = orgId ? { orgId } : {};
  const users: any[] = await (User as any).find(userQuery).select('_id orgId email positions');

  let updated = 0;
  for (const u of users) {
    if (Array.isArray(u.positions) && u.positions.length > 0) continue;
    const org = u.orgId;
    // Find distinct positionIds from shifts where this user is assigned
    const shifts: any[] = await (Shift as any)
      .find({ orgId: org, 'assignments.userId': u._id })
      .select('positionId')
      .limit(200);
    const posIds = Array.from(new Set(shifts.map((s) => String(s.positionId))));
    if (posIds.length === 0) continue;
    await (User as any).updateOne({ _id: u._id }, { $set: { positions: posIds } });
    updated++;
  }

  await mongoose.disconnect();
  console.log(`Backfill complete. Updated ${updated} users.`);
}

backfill(process.env.SEED_ORG_ID).catch((e) => {
  console.error(e);
  process.exit(1);
});
