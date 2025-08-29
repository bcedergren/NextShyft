import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Invite from '@/models/Invite';
import User from '@/models/User';
import Org from '@/models/Org';
import { limitFor } from '@/lib/planLimits';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { token, password, firstName, lastName } = await req.json();

  if (!token || !password || !firstName || !lastName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await dbConnect();

  const invite = await (Invite as any).findOne({ token, status: 'PENDING' });
  if (!invite) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
  }

  // Enforce plan limit before creating user
  const org = await (Org as any).findById(invite.orgId).select('plan');
  const count = await (User as any).countDocuments({ orgId: invite.orgId });
  const limit = limitFor(org?.plan).staff;
  if (count >= limit) {
    return NextResponse.json({ error: 'Plan limit reached', upgrade: true }, { status: 402 });
  }

  try {
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    // Create or update user
    await (User as any).findOneAndUpdate(
      { email: invite.email },
      {
        $set: {
          email: invite.email,
          orgId: invite.orgId,
          roles: [invite.role],
          firstName,
          lastName,
          passwordHash: hash,
          positions: [],
        },
      },
      { upsert: true },
    );

    // Mark invite as accepted
    invite.status = 'ACCEPTED';
    await invite.save();

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to complete setup' }, { status: 500 });
  }
}
