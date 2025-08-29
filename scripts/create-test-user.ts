// npx ts-node scripts/create-test-user.ts
import mongoose from 'mongoose';
import User from '@/models/User';
import Org from '@/models/Org';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextshyft';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  // Create a test organization if it doesn't exist
  let org = await (Org as any).findOne({ name: 'Test Organization' });
  if (!org) {
    org = await (Org as any).create({
      name: 'Test Organization',
      plan: 'pro',
      signupCode: 'TEST01',
    });
    console.log('Created test organization:', org._id);
  }

  // Check if test user already exists
  const existingUser = await (User as any).findOne({ email: 'test@example.com' });
  if (existingUser) {
    console.log('Test user already exists. Updating password...');
    const password = 'password123';
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    existingUser.passwordHash = hash;
    await existingUser.save();
    console.log('Updated test user password to: password123');
  } else {
    // Create a test user
    const password = 'password123';
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    const user = await (User as any).create({
      orgId: org._id,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      roles: ['OWNER'],
      passwordHash: hash,
    });

    console.log('Created test user:', user._id);
    console.log('Email: test@example.com');
    console.log('Password: password123');
  }

  console.log('Test user setup complete!');
  console.log('You can now sign in with:');
  console.log('Email: test@example.com');
  console.log('Password: password123');

  process.exit(0);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
