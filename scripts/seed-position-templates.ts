// npx tsx scripts/seed-position-templates.ts --org <ORG_ID>
/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose from 'mongoose';
import Position from '@/models/Position';
import ShiftTemplate from '@/models/ShiftTemplate';

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === '--org' || a === '-o') && args[i + 1]) out.org = args[++i];
  }
  return out;
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  (process.env as any).MongoDB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  'mongodb://127.0.0.1:27017/nextshyft';

async function main() {
  const { org: ORG_ID = process.env.SEED_ORG_ID || '' } = parseArgs();
  if (!ORG_ID) {
    console.error('Missing --org <id> (or set SEED_ORG_ID)');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log('Connected');
  const positions = await (Position as any).find({ orgId: ORG_ID });
  let created = 0;
  for (const p of positions) {
    for (const dow of ['fri', 'sat']) {
      for (let h = 18; h < 22; h++) {
        const doc: any = {
          orgId: ORG_ID,
          positionId: p._id,
          dayOfWeek: dow,
          start: `${String(h).padStart(2, '0')}:00`,
          end: `${String(h + 1).padStart(2, '0')}:00`,
          requiredCount: 1,
        };
        const exists = await (ShiftTemplate as any).findOne(doc);
        if (!exists) {
          await (ShiftTemplate as any).create(doc);
          created++;
        }
      }
    }
  }
  console.log(`Templates seeded: ${created}`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
