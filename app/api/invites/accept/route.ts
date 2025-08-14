import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Invite from '@/models/Invite';
import User from '@/models/User';

export async function POST(req: Request) {
  const { token } = await req.json();
  await dbConnect();
  const invite = await (Invite as any).findOne({ token, status: 'PENDING' });
  if (!invite) return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
  // Upsert user with org/role (email as unique id for now)
  await (User as any).findOneAndUpdate(
    { email: invite.email },
    {
      $set: {
        email: invite.email,
        orgId: invite.orgId,
        roles: [invite.role],
        firstName: invite.firstName || '',
        lastName: invite.lastName || '',
      },
    },
    { upsert: true },
  );
  invite.status = 'ACCEPTED';
  await invite.save();
  return NextResponse.json({ ok: true });
}
