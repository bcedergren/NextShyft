import { requireManager } from '@/lib/authorize';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Schedule from '@/models/Schedule';
import Shift from '@/models/Shift';
import User from '@/models/User';
import Audit from '@/models/Audit';
import { sendPushToUsers } from '@/lib/push';
import Notification from '@/models/Notification';
import { Resend } from 'resend';
import { notificationService, auditService } from '@/lib/di';

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const guard = await requireManager();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  await dbConnect();
  const schedule = await (Schedule as any).findById(params.id);
  if (!schedule) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const shifts = await (Shift as any).find({ scheduleId: schedule._id });
  const users = await (User as any).find({ orgId: schedule.orgId });

  const byUser: Record<string, string[]> = {};
  for (const s of shifts) {
    for (const a of s.assignments) {
      const uid = String(a.userId);
      byUser[uid] = byUser[uid] || [];
      byUser[uid].push(`${new Date(s.date).toDateString()} ${s.start}-${s.end}`);
    }
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
  const resend = apiKey ? new Resend(apiKey) : null;
  let sent = 0;
  const toPush: string[] = [];
  for (const u of users) {
    const list = byUser[String(u._id)] || byUser[String(u.email)] || [];
    if (!list.length || !resend || !u.email) continue;
    await resend.emails.send({
      from,
      to: u.email,
      subject: 'Your NextShyft schedule',
      html: `<p>Shifts:</p><ul>${list.map((l) => `<li>${l}</li>`).join('')}</ul>`,
    });
    sent++;
    toPush.push(u.email);
    // create notification
    await (Notification as any).create({
      orgId: String(schedule.orgId),
      userEmail: u.email,
      type: 'SCHEDULE_PUBLISHED',
      title: 'Schedule published',
      body: `You have ${list.length} upcoming shifts.`,
    });
  }

  schedule.status = 'published';
  schedule.publishedAt = new Date();
  await schedule.save();
  await auditService.log(String(schedule.orgId), 'system', 'SCHEDULE_PUBLISH', {
    scheduleId: String(schedule._id),
    emailsSent: sent,
  });
  return NextResponse.json({ ok: true, sent });
}
