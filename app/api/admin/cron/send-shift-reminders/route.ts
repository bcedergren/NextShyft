import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { ResendEmailSender } from '@/services/EmailSender';
import { NotificationService } from '@/services/NotificationService';
import { WebPushSender } from '@/services/PushSender';
import { sendSMS } from '@/lib/notify';

function toDateTime(date: Date, time: string) {
  const [hh, mm] = time.split(':').map((v) => parseInt(v, 10));
  const dt = new Date(date);
  dt.setHours(hh, mm, 0, 0);
  return dt;
}

export async function POST() {
  const session = await getServerSession(authOptions);
  const roles = ((session?.user as any)?.roles || []) as string[];
  const isAdmin = !!roles?.find((r) => ['OWNER', 'MANAGER', 'SUPER_ADMIN', 'ADMIN'].includes(r));
  if (!session || !isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await dbConnect();

  const users: any[] = await (User as any)
    .find({ 'notificationPrefs.shiftReminderEnabled': true })
    .select('email phone phoneVerified notificationPrefs');

  if (users.length === 0) return NextResponse.json({ ok: true, sent: 0 });

  const maxHours = Math.max(...users.map((u) => u.notificationPrefs?.shiftReminderHours || 1), 1);
  const now = new Date();
  const cutoff = new Date(now.getTime() + maxHours * 3600_000);

  const shifts: any[] = await (Shift as any).find({
    date: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()), $lte: cutoff },
  });

  const userById = new Map<string, any>();
  for (const u of users) userById.set(String(u._id), u);

  const emailSender = new ResendEmailSender();
  const pushSender = new WebPushSender();
  const notifService = new NotificationService(emailSender, pushSender);

  let sent = 0;

  for (const sh of shifts) {
    const startDt = toDateTime(sh.date, sh.start);
    const hoursUntil = (startDt.getTime() - now.getTime()) / 3600_000;
    if (hoursUntil < 0) continue;
    for (const a of sh.assignments || []) {
      const u = userById.get(String(a.userId));
      if (!u) continue;
      const threshold = u.notificationPrefs?.shiftReminderHours || 1;
      if (hoursUntil <= threshold + 0.001) {
        const existing = await (Notification as any).findOne({
          userEmail: u.email,
          type: 'SHIFT_REMINDER',
          // naive body regex match by shift id
          body: new RegExp(String(sh._id)),
        });
        if (existing) continue;
        const title = 'Upcoming shift reminder';
        const body = `Your shift (${sh.start}-${sh.end}) starts soon. [${sh._id}]`;
        await notifService.notify({
          orgId: String(sh.orgId || ''),
          userEmail: u.email,
          type: 'SHIFT_REMINDER',
          title,
          body,
          email: u.notificationPrefs?.email
            ? { subject: title, html: `<p>${body}</p>` }
            : undefined,
          push: u.notificationPrefs?.inApp ? { title, body } : undefined,
        });
        if (u.notificationPrefs?.sms && u.phoneVerified && u.phone) {
          await sendSMS(u.phone, `Reminder: your shift ${sh.start}-${sh.end} starts soon.`);
        }
        sent++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent });
}
