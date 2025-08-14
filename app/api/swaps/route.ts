import { dbConnect } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getRequestContext } from '@/lib/requestContext';
import { ResendEmailSender } from '@/services/EmailSender';
import { WebPushSender } from '@/services/PushSender';
import { SwapService } from '@/services/SwapService';
import SwapRequest from '@/models/SwapRequest';
import Audit from '@/models/Audit';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';
import Notification from '@/models/Notification';
import { sendPushToUsers } from '@/lib/push';
import Shift from '@/models/Shift';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const docs = await (SwapRequest as any).find({ orgId }).sort({ createdAt: -1 }).limit(50);
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const actorEmail = (session.user as any)?.email || 'unknown';
  await dbConnect();
  const body = await req.json();
  // Attach requesterId from session user record (if available)
  const requester = await (User as any).findOne({ orgId, email: actorEmail });
  const created = await (SwapRequest as any).create({
    ...body,
    orgId,
    requesterId: requester?._id,
    history: [{ actorId: requester?._id || null, action: 'CREATE' }],
  });
  await (Audit as any).create({ orgId, actorEmail, action: 'SWAP_CREATE', payload: created });
  // Fan-out an announcement-style notification to employees with the same position
  try {
    const shift = await (Shift as any).findById(created.shiftId);
    if (shift) {
      const positionKey = String(shift.positionId);
      const samePosUsers: any[] = await (User as any)
        .find({ orgId, positions: { $in: [positionKey] } })
        .select('email');
      const recipientEmails = samePosUsers
        .map((u: any) => u.email)
        .filter((e: string) => !!e && e !== actorEmail);
      const title = 'Shift swap requested';
      const bodyText =
        'A coworker requested to swap a shift for your position. Please review in the app.';
      for (const email of recipientEmails) {
        await (Notification as any).create({
          orgId,
          userEmail: email,
          type: 'SWAP_REQUEST',
          title,
          body: bodyText,
        });
      }
      if (recipientEmails.length > 0) {
        await sendPushToUsers(recipientEmails, {
          title,
          body: bodyText,
          url: '/org/demo/inbox',
        });
      }
    }
  } catch (e) {
    // best-effort notifications; do not fail request if targeting fails
  }
  // notify manager placeholder (email)
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
  if (apiKey) {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: 'manager@example.com',
      subject: 'New swap request',
      html: '<p>New swap pending approval.</p>',
    });
  }
  return NextResponse.json({ ok: true, swap: created });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const actorEmail = (session.user as any)?.email || 'unknown';
  await dbConnect();
  const body = await req.json();
  const doc = await (SwapRequest as any).findOne({ _id: body.id, orgId });
  if (!doc) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  doc.status = body.action === 'APPROVE' ? 'MANAGER_APPROVED' : 'DENIED';
  doc.history.push({ actorId: null as any, action: body.action });
  await doc.save();
  await (Audit as any).create({
    orgId,
    actorEmail,
    action: `SWAP_${doc.status}`,
    payload: { id: doc._id },
  });
  // If approved and a direct target is set, update shift assignment
  if (
    doc.status === 'MANAGER_APPROVED' &&
    doc.type === 'direct' &&
    doc.targetUserId &&
    doc.requesterId
  ) {
    const sh: any = await (Shift as any).findById(doc.shiftId);
    if (sh) {
      const curr = (sh.assignments || []).map((a: any) => String(a.userId));
      const next = curr.map((uid: string) =>
        uid === String(doc.requesterId) ? String(doc.targetUserId) : uid,
      );
      sh.assignments = next.map((uid: string) => ({ userId: uid }));
      await sh.save();
    }
  }
  // notify requester
  await (Notification as any).create({
    orgId,
    userEmail: 'employee@example.com',
    type: `SWAP_${doc.status}`,
    title: `Swap ${doc.status}`,
    body: 'Your swap request was processed.',
  });
  await sendPushToUsers(['employee@example.com'], {
    title: `Swap ${doc.status}`,
    body: 'Your swap request was processed.',
    url: '/org/demo/inbox',
  });
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@nextshyft.app',
      to: 'employee@example.com',
      subject: `Swap ${doc.status}`,
      html: `<p>Your swap is ${doc.status}</p>`,
    });
  }
  return NextResponse.json({ ok: true, swap: doc });
}
