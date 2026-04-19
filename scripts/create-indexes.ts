#!/usr/bin/env tsx
/**
 * Create database indexes for optimal query performance
 * Run with: npm run create-indexes (add to package.json)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function createIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected successfully\n');

    const db = mongoose.connection.db;
    if (!db) throw new Error('Database connection not established');

    // Users collection
    console.log('Creating indexes for users...');
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ orgId: 1 });
    await db.collection('users').createIndex({ orgId: 1, roles: 1 });
    await db.collection('users').createIndex({ 'reset.token': 1 }, { sparse: true });
    console.log('✓ Users indexes created');

    // Organizations collection
    console.log('Creating indexes for orgs...');
    await db.collection('orgs').createIndex({ signupCode: 1 }, { sparse: true });
    await db.collection('orgs').createIndex({ isDemo: 1 });
    await db.collection('orgs').createIndex({ stripeCustomerId: 1 }, { sparse: true });
    console.log('✓ Orgs indexes created');

    // Shifts collection
    console.log('Creating indexes for shifts...');
    await db.collection('shifts').createIndex({ scheduleId: 1 });
    await db.collection('shifts').createIndex({ orgId: 1 });
    await db.collection('shifts').createIndex({ assignedTo: 1 });
    await db.collection('shifts').createIndex({ orgId: 1, date: 1 });
    await db.collection('shifts').createIndex({ scheduleId: 1, date: 1 });
    console.log('✓ Shifts indexes created');

    // Schedules collection
    console.log('Creating indexes for schedules...');
    await db.collection('schedules').createIndex({ orgId: 1 });
    await db.collection('schedules').createIndex({ orgId: 1, startDate: 1 });
    await db.collection('schedules').createIndex({ status: 1 });
    console.log('✓ Schedules indexes created');

    // Availability collection
    console.log('Creating indexes for availabilities...');
    await db.collection('availabilities').createIndex({ userId: 1 }, { unique: true });
    await db.collection('availabilities').createIndex({ orgId: 1 });
    console.log('✓ Availabilities indexes created');

    // Positions collection
    console.log('Creating indexes for positions...');
    await db.collection('positions').createIndex({ orgId: 1 });
    console.log('✓ Positions indexes created');

    // ShiftTemplates collection
    console.log('Creating indexes for shifttemplates...');
    await db.collection('shifttemplates').createIndex({ orgId: 1 });
    await db.collection('shifttemplates').createIndex({ orgId: 1, day: 1 });
    console.log('✓ ShiftTemplates indexes created');

    // Notifications collection
    console.log('Creating indexes for notifications...');
    await db.collection('notifications').createIndex({ userId: 1 });
    await db.collection('notifications').createIndex({ userId: 1, read: 1 });
    await db.collection('notifications').createIndex({ userId: 1, createdAt: -1 });
    console.log('✓ Notifications indexes created');

    // SwapRequests collection
    console.log('Creating indexes for swaprequests...');
    await db.collection('swaprequests').createIndex({ orgId: 1 });
    await db.collection('swaprequests').createIndex({ requesterId: 1 });
    await db.collection('swaprequests').createIndex({ status: 1 });
    await db.collection('swaprequests').createIndex({ orgId: 1, status: 1 });
    console.log('✓ SwapRequests indexes created');

    // Invites collection
    console.log('Creating indexes for invites...');
    await db.collection('invites').createIndex({ orgId: 1 });
    await db.collection('invites').createIndex({ email: 1 });
    await db.collection('invites').createIndex({ token: 1 }, { unique: true });
    await db.collection('invites').createIndex({ status: 1 });
    await db.collection('invites').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    console.log('✓ Invites indexes created');

    // Announcements collection
    console.log('Creating indexes for announcements...');
    await db.collection('announcements').createIndex({ orgId: 1 });
    await db.collection('announcements').createIndex({ orgId: 1, createdAt: -1 });
    await db.collection('announcements').createIndex({ pinned: 1, createdAt: -1 });
    console.log('✓ Announcements indexes created');

    // Audit collection
    console.log('Creating indexes for audits...');
    await db.collection('audits').createIndex({ orgId: 1 });
    await db.collection('audits').createIndex({ userId: 1 });
    await db.collection('audits').createIndex({ orgId: 1, timestamp: -1 });
    await db.collection('audits').createIndex({ action: 1 });
    console.log('✓ Audits indexes created');

    // OrgPolicies collection
    console.log('Creating indexes for orgpolicies...');
    await db.collection('orgpolicies').createIndex({ orgId: 1 }, { unique: true });
    console.log('✓ OrgPolicies indexes created');

    console.log('\n✅ All indexes created successfully!');
    
    // List all indexes for verification
    console.log('\nVerifying indexes...');
    const collections = await db.listCollections().toArray();
    for (const collection of collections) {
      const indexes = await db.collection(collection.name).indexes();
      console.log(`\n${collection.name} (${indexes.length} indexes):`);
      indexes.forEach(idx => {
        const keys = Object.keys(idx.key).join(', ');
        const unique = idx.unique ? ' [unique]' : '';
        console.log(`  - ${keys}${unique}`);
      });
    }

  } catch (error) {
    console.error('Error creating indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

createIndexes();
