import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Invite from '@/models/Invite';
import User from '@/models/User';

export async function POST(req: Request) {
  const { token } = await req.json();
  await dbConnect();
  const invite = await (Invite as any).findOne({ token, status: 'PENDING' });
  if (!invite) return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });

  // Check if user already exists and has a password
  const existingUser = await (User as any).findOne({ email: invite.email });

  if (existingUser && existingUser.passwordHash) {
    // User exists and has password, just update the invite status
    invite.status = 'ACCEPTED';
    await invite.save();
    return NextResponse.json({ ok: true, needsPassword: false });
  } else if (existingUser) {
    // User exists but no password, needs to complete setup
    return NextResponse.json({
      ok: true,
      needsPassword: true,
      email: invite.email,
      orgId: invite.orgId,
      role: invite.role,
    });
  } else {
    // User doesn't exist, needs to complete setup
    return NextResponse.json({
      ok: true,
      needsPassword: true,
      email: invite.email,
      orgId: invite.orgId,
      role: invite.role,
    });
  }
}
