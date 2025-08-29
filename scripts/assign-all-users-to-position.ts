// npx tsx scripts/assign-all-users-to-position.ts [--org <ORG_ID>] [--position <POSITION_NAME_OR_ID>]
/* eslint-disable no-console */
import dotenv from 'dotenv';
// Load .env.local then .env
dotenv.config({ path: '.env.local' });
dotenv.config();
import mongoose, { Types } from 'mongoose';
import User from '@/models/User';
import Position from '@/models/Position';

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if ((a === '--org' || a === '-o') && args[i + 1]) out.org = args[++i];
    else if ((a === '--position' || a === '-p') && args[i + 1]) out.position = args[++i];
  }
  return out;
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  (process.env as any).MongoDB_URI ||
  process.env.NEXT_PUBLIC_MONGODB_URI ||
  'mongodb://127.0.0.1:27017/nextshyft';

async function main() {
  const { org: orgArg, position: posArg } = parseArgs();
  const ORG_ID = orgArg || process.env.SEED_ORG_ID || process.env.ORG_ID || '';
  if (!ORG_ID) {
    console.warn('No ORG_ID provided; use --org <id> or set SEED_ORG_ID/ORG_ID');
  }
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to DB');

  // Resolve target position (prefer org-scoped matches, and only cast _id when valid)
  let pos: any = null;
  if (posArg) {
    if (Types.ObjectId.isValid(posArg)) {
      pos = await (Position as any).findOne({ _id: new Types.ObjectId(posArg) });
    }
    if (!pos) {
      // Try by name within org first (if provided), then any org
      if (ORG_ID) pos = await (Position as any).findOne({ orgId: ORG_ID, name: posArg });
      if (!pos) pos = await (Position as any).findOne({ name: posArg });
    }
  } else {
    // Prefer a common default like 'Server'; else use the first position
    if (ORG_ID) pos = await (Position as any).findOne({ orgId: ORG_ID, name: 'Server' });
    if (!pos) pos = await (Position as any).findOne({ name: 'Server' });
    if (!pos && ORG_ID) pos = await (Position as any).findOne({ orgId: ORG_ID });
    if (!pos) pos = await (Position as any).findOne({});
  }
  if (!pos) {
    console.error('No target position found. Create a position or pass --position <name|id>.');
    process.exit(1);
  }

  // Build user query: EMPLOYEEs in org (if provided) with empty/missing positions
  const query: any = {
    roles: 'EMPLOYEE',
    $or: [{ positions: { $exists: false } }, { positions: { $size: 0 } }],
  };
  if (ORG_ID) query.orgId = ORG_ID;

  const users: any[] = await (User as any).find(query).select('_id email positions orgId');
  if (users.length === 0) {
    console.log('No users to update. They may already have positions.');
    await mongoose.disconnect();
    return;
  }

  const res = await (User as any).updateMany(query, { $set: { positions: [pos._id] } });
  console.log(`Updated ${res.modifiedCount || 0} users to position '${pos.name || pos._id}'.`);

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
