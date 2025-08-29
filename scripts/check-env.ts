// npx ts-node scripts/check-env.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

console.log('=== Environment Check ===\n');

const requiredVars = ['MONGODB_URI', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];

const optionalVars = ['RESEND_API_KEY', 'EMAIL_FROM'];

console.log('Required Environment Variables:');
requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('SECRET') ? '***SET***' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
  }
});

console.log('\nOptional Environment Variables:');
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('KEY') ? '***SET***' : value}`);
  } else {
    console.log(`⚠️  ${varName}: NOT SET (optional)`);
  }
});

console.log('\n=== MongoDB Connection Test ===');

// Test MongoDB connection
async function testMongoConnection() {
  try {
    const { MongoClient } = await import('mongodb');
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('❌ MONGODB_URI not set - cannot test connection');
      return;
    }

    console.log(`🔗 Attempting to connect to MongoDB...`);
    const client = new MongoClient(uri);
    await client.connect();
    console.log('✅ MongoDB connection successful!');
    await client.close();
  } catch (error) {
    console.log('❌ MongoDB connection failed:');
    console.log(error);
  }
}

testMongoConnection();

console.log('\n=== Next Steps ===');
console.log(
  '1. If MONGODB_URI is not set, create a .env.local file with your MongoDB connection string',
);
console.log('2. If using MongoDB Atlas, get your connection string from the Atlas dashboard');
console.log(
  '3. If running locally, start MongoDB or use Docker: docker run -d --name mongodb -p 27017:27017 mongo:latest',
);
console.log('4. After setting up MongoDB, run: npm run create:test-user');
