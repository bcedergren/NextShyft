import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Invite from '@/models/Invite';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const { firstName = '', lastName = '', role } = await req.json();
  const update: any = { firstName, lastName };
  if (role) update.role = role;
  const doc = await (Invite as any).findOneAndUpdate(
    { _id: params.id, orgId: (session as any).orgId, status: 'PENDING' },
    { $set: update },
    { new: true },
  );
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, invite: doc });
}

import { auditService } from '@/lib/di';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const actorEmail = (session as any).user?.email;
  await dbConnect();

  const invite = await (Invite as any).findOne({ _id: params.id, orgId });
  if (!invite) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (invite.status === 'PENDING') {
    invite.status = 'CANCELLED';
    await invite.save();
    await auditService.log(orgId, actorEmail, 'INVITE_CANCELLED', { email: invite.email });
    return NextResponse.json({ ok: true, status: 'CANCELLED' });
  } else {
    await (Invite as any).deleteOne({ _id: params.id, orgId });
    await auditService.log(orgId, actorEmail, 'INVITE_DELETED', { email: invite.email });
    return NextResponse.json({ ok: true, status: 'DELETED' });
  }
}
