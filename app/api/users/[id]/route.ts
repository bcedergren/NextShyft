import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { requireManager } from '@/lib/authorize';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const guard = await requireManager();
  if (!guard.ok) return NextResponse.json({ error: guard.message }, { status: guard.status });
  const orgId = (guard.session as any)?.orgId;
  await dbConnect();
  const body = await req.json();
  const firstName = body?.firstName ?? '';
  const lastName = body?.lastName ?? '';
  const requestedRole = String(body?.role || '').toUpperCase();

  // Build update: names are direct; role changes are restricted to EMPLOYEE/MANAGER by managers
  const update: any = { firstName, lastName };
  if (requestedRole === 'EMPLOYEE' || requestedRole === 'MANAGER') {
    // Load current roles to compute next
    const current: any = await (User as any).findOne({ _id: params.id, orgId }).select('roles');
    if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const roles: string[] = Array.isArray(current.roles) ? current.roles : [];
    let nextRoles = roles.slice();
    if (requestedRole === 'MANAGER') {
      if (!nextRoles.includes('MANAGER')) nextRoles.push('MANAGER');
    } else if (requestedRole === 'EMPLOYEE') {
      nextRoles = nextRoles.filter((r) => r !== 'MANAGER');
    }
    update.roles = nextRoles;
  }

  const updated = await (User as any).findOneAndUpdate(
    { _id: params.id, orgId },
    { $set: update },
    { new: true },
  );
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, user: updated });
}
