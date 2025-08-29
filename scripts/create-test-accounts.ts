// npx ts-node scripts/create-test-accounts.ts
import mongoose from 'mongoose';
import User from '@/models/User';
import Org from '@/models/Org';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextshyft';

const testAccounts = [
  {
    email: 'owner@test.com',
    firstName: 'Test',
    lastName: 'Owner',
    roles: ['OWNER'],
    password: 'password123',
    description: 'Full access to everything - can manage users, settings, billing, etc.',
  },
  {
    email: 'manager@test.com',
    firstName: 'Test',
    lastName: 'Manager',
    roles: ['MANAGER'],
    password: 'password123',
    description:
      'Can manage schedules, shifts, and employees - no access to billing or org settings',
  },
  {
    email: 'employee@test.com',
    firstName: 'Test',
    lastName: 'Employee',
    roles: ['EMPLOYEE'],
    password: 'password123',
    description: 'Basic access - can view schedule, submit availability, request swaps',
  },
];

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
  } else {
    console.log('Using existing test organization:', org._id);
  }

  console.log('\n=== Creating Test Accounts ===\n');

  for (const account of testAccounts) {
    // Check if user already exists
    const existingUser = await (User as any).findOne({ email: account.email });

    if (existingUser) {
      console.log(`🔄 Updating existing user: ${account.email}`);
      // Update password and roles
      const hash = crypto.createHash('sha256').update(account.password).digest('hex');
      existingUser.passwordHash = hash;
      existingUser.roles = account.roles;
      existingUser.firstName = account.firstName;
      existingUser.lastName = account.lastName;
      await existingUser.save();
      console.log(`✅ Updated ${account.email} (${account.roles.join(', ')})`);
    } else {
      console.log(`🆕 Creating new user: ${account.email}`);
      // Create new user
      const hash = crypto.createHash('sha256').update(account.password).digest('hex');

      const user = await (User as any).create({
        orgId: org._id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        roles: account.roles,
        passwordHash: hash,
      });

      console.log(`✅ Created ${account.email} (${account.roles.join(', ')})`);
    }
  }

  console.log('\n=== Test Accounts Summary ===');
  console.log('Organization: Test Organization');
  console.log('All accounts use password: password123\n');

  testAccounts.forEach((account) => {
    console.log(`👤 ${account.email}`);
    console.log(`   Name: ${account.firstName} ${account.lastName}`);
    console.log(`   Role: ${account.roles.join(', ')}`);
    console.log(`   Description: ${account.description}`);
    console.log('');
  });

  console.log('=== How to Use ===');
  console.log('1. Go to http://localhost:3000/signin');
  console.log('2. Sign in with any of the accounts above');
  console.log('3. Test different role permissions and features');
  console.log('4. Check browser console for authentication debugging logs');

  process.exit(0);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
