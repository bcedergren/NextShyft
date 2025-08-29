// npx tsx scripts/seed-comprehensive.ts
import mongoose from 'mongoose';
import Org from '@/models/Org';
import User from '@/models/User';
import Position from '@/models/Position';
import ShiftTemplate from '@/models/ShiftTemplate';
import Availability from '@/models/Availability';
import OrgPolicy from '@/models/OrgPolicy';
import Schedule from '@/models/Schedule';
import Shift from '@/models/Shift';
import Announcement from '@/models/Announcement';
import Notification from '@/models/Notification';
import Invite from '@/models/Invite';
import crypto from 'crypto';
import dayjs from 'dayjs';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nextshyft';
const ORG_NAME = process.env.SEED_ORG_NAME || 'Demo Bar & Grill';
const ORG_ID = process.env.SEED_ORG_ID || new mongoose.Types.ObjectId().toString();

const staff = [
  { name: 'Alex Rivera', email: 'alex@example.com', firstName: 'Alex', lastName: 'Rivera' },
  { name: 'Jordan Lee', email: 'jordan@example.com', firstName: 'Jordan', lastName: 'Lee' },
  { name: 'Sam Patel', email: 'sam@example.com', firstName: 'Sam', lastName: 'Patel' },
  { name: 'Taylor Kim', email: 'taylor@example.com', firstName: 'Taylor', lastName: 'Kim' },
  { name: 'Riley Chen', email: 'riley@example.com', firstName: 'Riley', lastName: 'Chen' },
  { name: 'Casey Johnson', email: 'casey@example.com', firstName: 'Casey', lastName: 'Johnson' },
  { name: 'Morgan Smith', email: 'morgan@example.com', firstName: 'Morgan', lastName: 'Smith' },
];

const positions = [
  { name: 'Bartender', color: '#FF6B6B' },
  { name: 'Server', color: '#4ECDC4' },
  { name: 'Host', color: '#45B7D1' },
  { name: 'Barback', color: '#96CEB4' },
  { name: 'Kitchen', color: '#FFEAA7' },
  { name: 'Manager', color: '#DDA0DD' },
];

const announcements = [
  {
    title: 'New Menu Items Available!',
    content: 'We\'ve added several new craft cocktails and appetizers to our menu. Please familiarize yourself with the new items.',
    priority: 'medium'
  },
  {
    title: 'Staff Meeting This Friday',
    content: 'Monthly staff meeting at 2 PM. We\'ll discuss upcoming events and new policies.',
    priority: 'high'
  },
  {
    title: 'Holiday Schedule Update',
    content: 'We\'ll be open on Thanksgiving but with modified hours. Check the schedule for your assigned shifts.',
    priority: 'medium'
  },
  {
    title: 'New POS System Training',
    content: 'We\'re upgrading our POS system next week. Training sessions will be scheduled for all staff.',
    priority: 'high'
  }
];

function range(n: number) {
  return Array.from({ length: n }, (_, i) => i);
}

function getRandomTime(startHour: number, endHour: number) {
  const hour = Math.floor(Math.random() * (endHour - startHour)) + startHour;
  const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function getRandomDuration() {
  const durations = [4, 6, 8];
  return durations[Math.floor(Math.random() * durations.length)];
}

async function main() {
  console.log('MongoDB URI:', MONGODB_URI);
  console.log('Environment variables loaded:', {
    MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not set',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set'
  });
  
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');

  // Clean up existing data
  console.log('Cleaning up existing data...');
  await Promise.all([
    (Org as any).deleteMany({}),
    (User as any).deleteMany({}),
    (Position as any).deleteMany({}),
    (ShiftTemplate as any).deleteMany({}),
    (Availability as any).deleteMany({}),
    (OrgPolicy as any).deleteMany({}),
    (Schedule as any).deleteMany({}),
    (Shift as any).deleteMany({}),
    (Announcement as any).deleteMany({}),
    (Notification as any).deleteMany({}),
    (Invite as any).deleteMany({}),
  ]);

  // Create organization
  const org = await (Org as any).create({
    _id: ORG_ID,
    name: ORG_NAME,
    plan: 'pro',
    signupCode: 'DEMO01',
  });
  console.log('Created organization:', org._id);

  // Create positions with colors
  const posDocs = await Promise.all(
    positions.map((pos) => (Position as any).create({ 
      orgId: ORG_ID, 
      name: pos.name,
      color: pos.color 
    })),
  );
  const posMap = Object.fromEntries(posDocs.map((p: any) => [p.name, p._id.toString()]));
  console.log('Created positions:', positions.map(p => p.name));

  // Create users with different roles and positions
  const users = [];
  for (let i = 0; i < staff.length; i++) {
    const s = staff[i];
    const password = 'password123';
    const hash = crypto.createHash('sha256').update(password).digest('hex');
    
    // Assign different roles and positions
    let roles = ['EMPLOYEE'];
    let userPositions = [];
    
    if (i === 0) { // Alex - Manager
      roles = ['MANAGER', 'EMPLOYEE'];
      userPositions = [posMap['Manager'], posMap['Bartender']];
    } else if (i === 1) { // Jordan - Lead Server
      roles = ['LEAD', 'EMPLOYEE'];
      userPositions = [posMap['Server']];
    } else if (i === 2) { // Sam - Bartender
      userPositions = [posMap['Bartender']];
    } else if (i === 3) { // Taylor - Server
      userPositions = [posMap['Server']];
    } else if (i === 4) { // Riley - Host
      userPositions = [posMap['Host']];
    } else if (i === 5) { // Casey - Kitchen
      userPositions = [posMap['Kitchen']];
    } else { // Morgan - Barback
      userPositions = [posMap['Barback']];
    }

    const user = await (User as any).create({
      orgId: ORG_ID,
      email: s.email,
      name: s.name,
      firstName: s.firstName,
      lastName: s.lastName,
      roles,
      positions: userPositions,
      passwordHash: hash,
    });
    users.push(user);
    console.log(`Created user: ${s.name} (${s.email}) - Roles: ${roles.join(', ')}`);
  }

  // Create organization policy
  await (OrgPolicy as any).create({
    orgId: ORG_ID,
    maxHoursPerDay: 10,
    minRestHours: 10,
    reqBreakMins: 30,
    maxConsecutiveDays: 6,
    overtimeThreshold: 40,
  });
  console.log('Created organization policy');

  // Create availability patterns
  const availabilityPatterns = [
    // Full-time staff (Mon-Fri)
    {
      pattern: { mon: [{ start: '09:00', end: '17:00' }], tue: [{ start: '09:00', end: '17:00' }], wed: [{ start: '09:00', end: '17:00' }], thu: [{ start: '09:00', end: '17:00' }], fri: [{ start: '09:00', end: '17:00' }], sat: [], sun: [] },
      users: [0, 1, 2] // Alex, Jordan, Sam
    },
    // Part-time staff (Thu-Sun)
    {
      pattern: { mon: [], tue: [], wed: [], thu: [{ start: '17:00', end: '23:00' }], fri: [{ start: '17:00', end: '23:00' }], sat: [{ start: '17:00', end: '23:00' }], sun: [{ start: '17:00', end: '22:00' }] },
      users: [3, 4, 5] // Taylor, Riley, Casey
    },
    // Weekend staff
    {
      pattern: { mon: [], tue: [], wed: [], thu: [], fri: [{ start: '18:00', end: '02:00' }], sat: [{ start: '18:00', end: '02:00' }], sun: [] },
      users: [6] // Morgan
    }
  ];

  for (const pattern of availabilityPatterns) {
    for (const userIndex of pattern.users) {
      await (Availability as any).create({
        orgId: ORG_ID,
        userEmail: staff[userIndex].email,
        weekly: pattern.pattern
      });
    }
  }
  console.log('Created availability patterns');

  // Create shift templates for different positions
  const shiftTemplates = [
    // Morning shifts
    { position: 'Host', dayOfWeek: 'mon', start: '09:00', end: '17:00', requiredCount: 1 },
    { position: 'Host', dayOfWeek: 'tue', start: '09:00', end: '17:00', requiredCount: 1 },
    { position: 'Host', dayOfWeek: 'wed', start: '09:00', end: '17:00', requiredCount: 1 },
    { position: 'Host', dayOfWeek: 'thu', start: '09:00', end: '17:00', requiredCount: 1 },
    { position: 'Host', dayOfWeek: 'fri', start: '09:00', end: '17:00', requiredCount: 1 },
    
    // Evening shifts
    { position: 'Server', dayOfWeek: 'thu', start: '17:00', end: '23:00', requiredCount: 2 },
    { position: 'Server', dayOfWeek: 'fri', start: '17:00', end: '23:00', requiredCount: 3 },
    { position: 'Server', dayOfWeek: 'sat', start: '17:00', end: '23:00', requiredCount: 3 },
    { position: 'Server', dayOfWeek: 'sun', start: '17:00', end: '22:00', requiredCount: 2 },
    
    // Bar shifts
    { position: 'Bartender', dayOfWeek: 'thu', start: '17:00', end: '23:00', requiredCount: 1 },
    { position: 'Bartender', dayOfWeek: 'fri', start: '17:00', end: '02:00', requiredCount: 2 },
    { position: 'Bartender', dayOfWeek: 'sat', start: '17:00', end: '02:00', requiredCount: 2 },
    
    // Kitchen shifts
    { position: 'Kitchen', dayOfWeek: 'thu', start: '16:00', end: '23:00', requiredCount: 1 },
    { position: 'Kitchen', dayOfWeek: 'fri', start: '16:00', end: '02:00', requiredCount: 2 },
    { position: 'Kitchen', dayOfWeek: 'sat', start: '16:00', end: '02:00', requiredCount: 2 },
  ];

  for (const template of shiftTemplates) {
    await (ShiftTemplate as any).create({
      orgId: ORG_ID,
      positionId: posMap[template.position],
      dayOfWeek: template.dayOfWeek,
      start: template.start,
      end: template.end,
      requiredCount: template.requiredCount,
    });
  }
  console.log('Created shift templates');

  // Create a schedule for the current week
  const currentWeek = dayjs().startOf('week');
  const schedule = await (Schedule as any).create({
    orgId: ORG_ID,
    periodStart: currentWeek.toDate(),
    periodEnd: currentWeek.endOf('week').toDate(),
    status: 'published',
    publishedAt: new Date(),
    publishedBy: users[0]._id, // Alex (manager)
  });
  console.log('Created schedule for week starting:', currentWeek.format('YYYY-MM-DD'));

  // Create actual shifts for the current week
  const shifts = [];
  for (let day = 0; day < 7; day++) {
    const currentDate = currentWeek.add(day, 'day');
    const dayName = currentDate.format('ddd').toLowerCase();
    
    // Create shifts based on day of week
    if (dayName === 'mon' || dayName === 'tue' || dayName === 'wed') {
      // Morning shifts
      shifts.push({
        scheduleId: schedule._id,
        orgId: ORG_ID,
        positionId: posMap['Host'],
        userEmail: staff[0].email, // Alex
        start: currentDate.hour(9).minute(0).toDate(),
        end: currentDate.hour(17).minute(0).toDate(),
        status: 'ASSIGNED'
      });
    } else if (dayName === 'thu' || dayName === 'fri' || dayName === 'sat') {
      // Evening shifts
      shifts.push(
        {
          scheduleId: schedule._id,
          orgId: ORG_ID,
          positionId: posMap['Server'],
          userEmail: staff[3].email, // Taylor
          start: currentDate.hour(17).minute(0).toDate(),
          end: currentDate.hour(23).minute(0).toDate(),
          status: 'ASSIGNED'
        },
        {
          scheduleId: schedule._id,
          orgId: ORG_ID,
          positionId: posMap['Bartender'],
          userEmail: staff[2].email, // Sam
          start: currentDate.hour(17).minute(0).toDate(),
          end: currentDate.hour(23).minute(0).toDate(),
          status: 'ASSIGNED'
        }
      );
      
      if (dayName === 'fri' || dayName === 'sat') {
        // Late night shifts
        shifts.push(
          {
            scheduleId: schedule._id,
            orgId: ORG_ID,
            positionId: posMap['Server'],
            userEmail: staff[1].email, // Jordan
            start: currentDate.hour(18).minute(0).toDate(),
            end: currentDate.add(1, 'day').hour(2).minute(0).toDate(),
            status: 'ASSIGNED'
          },
          {
            scheduleId: schedule._id,
            orgId: ORG_ID,
            positionId: posMap['Barback'],
            userEmail: staff[6].email, // Morgan
            start: currentDate.hour(18).minute(0).toDate(),
            end: currentDate.add(1, 'day').hour(2).minute(0).toDate(),
            status: 'ASSIGNED'
          }
        );
      }
    }
  }

  await (Shift as any).insertMany(shifts);
  console.log(`Created ${shifts.length} shifts`);

  // Create announcements
  for (const announcement of announcements) {
    await (Announcement as any).create({
      orgId: ORG_ID,
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      createdBy: users[0]._id, // Alex (manager)
      expiresAt: dayjs().add(30, 'days').toDate(),
    });
  }
  console.log('Created announcements');

  // Create notifications for some users
  const notifications = [
    {
      userEmail: staff[1].email,
      title: 'Shift Reminder',
      content: 'You have a shift tomorrow at 5:00 PM',
      type: 'SHIFT_REMINDER',
      read: false
    },
    {
      userEmail: staff[2].email,
      title: 'Schedule Published',
      content: 'The new schedule for next week has been published',
      type: 'SCHEDULE_PUBLISHED',
      read: false
    },
    {
      userEmail: staff[3].email,
      title: 'New Announcement',
      content: 'Check out the new menu items announcement',
      type: 'ANNOUNCEMENT',
      read: true
    }
  ];

  for (const notification of notifications) {
    await (Notification as any).create({
      orgId: ORG_ID,
      ...notification
    });
  }
  console.log('Created notifications');

  // Create some pending invites
  const invites = [
    {
      email: 'newserver@example.com',
      orgId: ORG_ID,
      role: 'EMPLOYEE',
      status: 'PENDING',
      token: 'invite-token-1',
      expiresAt: dayjs().add(7, 'days').toDate(),
    },
    {
      email: 'newbartender@example.com',
      orgId: ORG_ID,
      role: 'EMPLOYEE',
      status: 'PENDING',
      token: 'invite-token-2',
      expiresAt: dayjs().add(7, 'days').toDate(),
    }
  ];

  for (const invite of invites) {
    await (Invite as any).create(invite);
  }
  console.log('Created pending invites');

  console.log('\n🎉 Comprehensive seed data created successfully!');
  console.log('\n📋 What was created:');
  console.log(`   • Organization: ${ORG_NAME}`);
  console.log(`   • ${users.length} users with different roles and positions`);
  console.log(`   • ${positions.length} positions with colors`);
  console.log(`   • Availability patterns for different staff types`);
  console.log(`   • Shift templates for various positions and days`);
  console.log(`   • Current week schedule with ${shifts.length} assigned shifts`);
  console.log(`   • ${announcements.length} announcements`);
  console.log(`   • ${notifications.length} notifications`);
  console.log(`   • ${invites.length} pending invites`);
  
  console.log('\n🔑 Login credentials:');
  console.log('   All users can sign in with password: password123');
  console.log('   Manager: alex@example.com');
  console.log('   Lead Server: jordan@example.com');
  console.log('   Bartender: sam@example.com');
  console.log('   Server: taylor@example.com');
  console.log('   Host: riley@example.com');
  console.log('   Kitchen: casey@example.com');
  console.log('   Barback: morgan@example.com');

  process.exit(0);
}

main().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
