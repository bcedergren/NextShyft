import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ inApp: true, email: true }, { status: 401 });
  const email = (session.user as any)?.email;
  await dbConnect();
  const doc: any = await (User as any).findOne({ email });
  const prefs = doc?.notificationPrefs || { inApp: true, email: true };
  return NextResponse.json({
    inApp: prefs.inApp ?? true,
    email: prefs.email ?? true,
    sms: prefs.sms ?? false,
    shiftReminderEnabled: prefs.shiftReminderEnabled ?? false,
    shiftReminderHours: prefs.shiftReminderHours ?? 1,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const email = (session.user as any)?.email;
  const body = await req.json();
  await dbConnect();
  await (User as any).updateOne(
    { email },
    {
      $set: {
        'notificationPrefs.inApp': body.inApp,
        'notificationPrefs.email': body.email,
        'notificationPrefs.sms': body.sms,
        'notificationPrefs.shiftReminderEnabled': body.shiftReminderEnabled,
        'notificationPrefs.shiftReminderHours': body.shiftReminderHours,
      },
    },
    { upsert: false },
  );
  return NextResponse.json({ ok: true });
}
