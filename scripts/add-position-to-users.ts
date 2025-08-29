// npx tsx scripts/add-position-to-users.ts --org <ORG_ID> --position <POSITION_NAME_OR_ID> [--includeManagers] [--dry]
/* eslint-disable no-console */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose, { Types } from 'mongoose';
import User from '@/models/User';
import Position from '@/models/Position';

type Args = {
  org?: string;
  position?: string;
  includeManagers?: boolean;
  dry?: boolean;
};

function parseArgs(): Args {
  const args = process.argv.slice(2);
  const out: Args = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === '--org' || a === '-o') && args[i + 1]) out.org = args[++i];
    else if ((a === '--position' || a === '-p') && args[i + 1]) out.position = args[++i];
    else if (a === '--includeManagers') out.includeManagers = true;
    else if (a === '--dry') out.dry = true;
  }
  return out;
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  (process.env as any).MongoDB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  'mongodb://127.0.0.1:27017/nextshyft';

async function main() {
  const { org: orgArg, position: posArg, includeManagers, dry } = parseArgs();
  const ORG_ID = orgArg || process.env.SEED_ORG_ID || process.env.ORG_ID || '';
  if (!posArg) {
    console.error('Missing --position <name|id>');
    process.exit(1);
  }
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  // Resolve position by id or name (prefer org-scoped name)
  let pos: any = null;
  if (Types.ObjectId.isValid(posArg)) {
    pos = await (Position as any).findOne({ _id: new Types.ObjectId(posArg) });
  }
  if (!pos) {
    if (ORG_ID) pos = await (Position as any).findOne({ orgId: ORG_ID, name: posArg });
    if (!pos) pos = await (Position as any).findOne({ name: posArg });
  }
  if (!pos) {
    console.error(`Position not found for '${posArg}'. Create it first.`);
    process.exit(1);
  }

  // Build user query (org-scoped if provided)
  const q: any = {};
  if (ORG_ID) q.orgId = ORG_ID;
  if (includeManagers) q.roles = { $in: ['EMPLOYEE', 'MANAGER'] };
  else q.roles = 'EMPLOYEE';

  // Use addToSet to avoid duplicates; no need to prefilter by membership
  const update = { $addToSet: { positions: pos._id } };

  if (dry) {
    const count = await (User as any).countDocuments(q);
    console.log(`[DRY] Would add position '${pos.name || pos._id}' to ${count} users`);
    await mongoose.disconnect();
    return;
  }

  const res = await (User as any).updateMany(q, update);
  console.log(
    `Updated ${res.modifiedCount || 0} users to include position '${pos.name || pos._id}'.`,
  );
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
