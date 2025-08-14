import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';
import User from '@/models/User';
import Availability from '@/models/Availability';
import AnnouncementRead from '@/models/AnnouncementRead';
import PushSubscription from '@/models/PushSubscription';
import Notification from '@/models/Notification';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sessionEmail = (session.user as any)?.email || '';
  const sessionName = (session.user as any)?.name || '';
  await dbConnect();
  const doc: any = await (User as any)
    .findOne({ email: sessionEmail })
    .select('email name phone phoneVerified');
  return NextResponse.json({
    email: doc?.email || sessionEmail,
    name: doc?.name || sessionName,
    phone: doc?.phone || '',
    phoneVerified: !!doc?.phoneVerified,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const currentEmail = (session.user as any)?.email;
  await dbConnect();
  const { name, email, phone } = await req.json();
  const nextName = typeof name === 'string' ? name.trim() : '';
  const nextEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!nextName || !nextEmail)
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });

  const emailChanged = nextEmail !== currentEmail;
  const currentUser: any = await (User as any).findOne({ email: currentEmail }).select('phone');
  const currentPhone: string = currentUser?.phone || '';
  const nextPhone = typeof phone === 'string' ? phone.trim() : currentPhone;
  const phoneChanged = typeof phone === 'string' && nextPhone !== currentPhone;

  if (emailChanged) {
    // Prevent collisions
    const existingUser: any = await (User as any).findOne({ email: nextEmail }).lean();
    if (existingUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
    // Check next-auth users collection for collisions
    const usersCol = mongoose.connection.db.collection('users');
    const existingAuthUser = await usersCol.findOne({ email: nextEmail });
    if (existingAuthUser) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }
  }

  // Update our User doc (upsert if missing)
  const setUpdate: any = { name: nextName, email: nextEmail };
  if (typeof phone === 'string') {
    setUpdate.phone = nextPhone;
  }
  const unsetUpdate: any = {};
  if (phoneChanged) {
    setUpdate.phoneVerified = false;
    unsetUpdate.phoneVerification = 1;
  }
  await (User as any).findOneAndUpdate(
    { email: currentEmail },
    { $set: setUpdate, ...(Object.keys(unsetUpdate).length ? { $unset: unsetUpdate } : {}) },
    { upsert: true },
  );

  // Update next-auth users collection (display name always; email when changed)
  const usersCol = mongoose.connection.db.collection('users');
  await usersCol.updateOne({ email: currentEmail }, { $set: { name: nextName, email: nextEmail } });

  if (emailChanged) {
    // Propagate email changes across collections that key by userEmail
    await Promise.all([
      (Availability as any).updateMany(
        { userEmail: currentEmail },
        { $set: { userEmail: nextEmail } },
      ),
      (AnnouncementRead as any).updateMany(
        { userEmail: currentEmail },
        { $set: { userEmail: nextEmail } },
      ),
      (PushSubscription as any).updateMany(
        { userEmail: currentEmail },
        { $set: { userEmail: nextEmail } },
      ),
      (Notification as any).updateMany(
        { userEmail: currentEmail },
        { $set: { userEmail: nextEmail } },
      ),
    ]);
  }

  return NextResponse.json({ ok: true, reauth: emailChanged });
}
