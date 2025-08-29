// npx tsx scripts/fix-user-password.ts
import mongoose from 'mongoose';
import User from '@/models/User';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextshyft';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  const email = 'brad.cedergren@gmail.com';
  const password = 'password123';

  // Find the existing user
  const user = await (User as any).findOne({ email });
  if (!user) {
    console.log(`User with email ${email} not found.`);
    process.exit(1);
  }

  // Update the password hash
  const hash = crypto.createHash('sha256').update(password).digest('hex');
  user.passwordHash = hash;
  await user.save();

  console.log(`Updated password for user: ${email}`);
  console.log(`New password: ${password}`);
  console.log('You can now sign in with this password.');

  process.exit(0);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
