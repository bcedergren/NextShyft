/* eslint-disable no-console */
import mongoose from 'mongoose';
import Org from '@/models/Org';
import User from '@/models/User';

async function main() {
  const mongo = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nextshyft_test';
  await mongoose.connect(mongo);

  const orgName = 'E2E Org';
  const ownerEmail = process.env.TEST_EMAIL || 'e2e-owner@example.com';

  let org = await (Org as any).findOne({ name: orgName });
  if (!org) {
    org = await (Org as any).create({ name: orgName, plan: 'free' });
    console.log('Created org', org._id.toString());
  } else {
    console.log('Using org', org._id.toString());
  }

  let user = await (User as any).findOne({ email: ownerEmail });
  if (!user) {
    user = await (User as any).create({
      email: ownerEmail,
      name: 'E2E Owner',
      orgId: org._id,
      roles: ['OWNER', 'ADMIN'],
    });
    console.log('Created user', user._id.toString());
  } else {
    console.log('Using user', user._id.toString());
  }

  await mongoose.disconnect();
  console.log('Seed complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
