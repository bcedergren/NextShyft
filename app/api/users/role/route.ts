import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { requireOwner } from '@/lib/authorize';
import User from '@/models/User';
import Audit from '@/models/Audit';

export async function PUT(req: Request) {
  const guard = await requireOwner();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  await dbConnect();
  const { email, role, op } = await req.json(); // op: 'add'|'remove'|'set'
  if (!email || !role)
    return NextResponse.json({ error: 'email and role required' }, { status: 400 });

  const user = await (User as any).findOne({ email });
  if (!user) return NextResponse.json({ error: 'user not found' }, { status: 404 });

  const roles: string[] = user.roles || [];
  let next = roles;
  if (op === 'set') next = [role];
  else if (op === 'add' && !roles.includes(role)) next = [...roles, role];
  else if (op === 'remove') next = roles.filter((r) => r !== role);

  await (User as any).updateOne({ _id: user._id }, { $set: { roles: next } });
  await (Audit as any).create({
    orgId: user.orgId,
    actorEmail: (guard.session!.user as any)?.email,
    action: 'ROLE_CHANGE',
    payload: { target: email, next },
  });
  return NextResponse.json({ ok: true, roles: next });
}
