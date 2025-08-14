import { requireManager } from '@/lib/authorize';

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Announcement from '@/models/Announcement';
import User from '@/models/User';
import { Resend } from 'resend';
import Notification from '@/models/Notification';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([]);
  await dbConnect();
  const orgId = (session as any).orgId;
  const docs = await (Announcement as any)
    .find({
      $and: [{ publishAt: { $lte: new Date() } }, { $or: [{ orgId }, { orgId: '*' }] }],
    })
    .sort({ pinned: -1, publishAt: -1 })
    .limit(50);
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const guard = await requireManager();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const roles = (((session as any).user as any)?.roles || []) as string[];
  const isSuperAdmin = roles.includes('SUPERADMIN');
  const targetOrgId = isSuperAdmin ? '*' : (session as any).orgId;
  const body = await req.json();
  const doc = await (Announcement as any).create({ ...body, orgId: targetOrgId });
  // simple fan-out marker notification (menu currently ignores '*')
  await (Notification as any).create({
    orgId: targetOrgId,
    userEmail: '*',
    type: 'ANNOUNCEMENT',
    title: body.title,
    body: body.body,
  });
  // Email fan-out to org users (org-scoped only)
  try {
    if (targetOrgId !== '*') {
      const users: any[] = await (User as any).find({ orgId: targetOrgId }).select('email');
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
      if (apiKey) {
        const resend = new Resend(apiKey);
        const subject = `Announcement: ${body.title || 'Update'}`;
        const html = `<h3>${body.title || 'Announcement'}</h3><p>${(body.body || '').replace(
          /\n/g,
          '<br/>',
        )}</p>`;
        for (const u of users) {
          if (!u?.email) continue;
          await resend.emails.send({ from, to: u.email, subject, html });
        }
      }
    }
  } catch {}
  return NextResponse.json(doc);
}
