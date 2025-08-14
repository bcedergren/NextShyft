import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import { limitFor } from '@/lib/planLimits';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const org = await (Org as any).findById(orgId);
  const count = await User.countDocuments({ orgId });
  const limit = limitFor(org?.plan).staff;
  const email = (session.user as any)?.email;
  const me = await (User as any).findOne({ orgId, email }).select('roles');
  const dbRoles = ((me?.roles as any) || []) as string[];
  const roles = dbRoles.length > 0 ? dbRoles : (((session.user as any)?.roles || []) as string[]);
  const isMgrOrEmp = roles.includes('MANAGER') || roles.includes('EMPLOYEE');
  const effectiveCount = count === 0 && isMgrOrEmp ? 1 : count;
  const pct = limit ? effectiveCount / limit : 0;
  const softCap = pct >= 0.8 && effectiveCount < limit;
  return NextResponse.json({
    count: effectiveCount,
    limit,
    atLimit: effectiveCount >= limit,
    softCap,
    pct,
    plan: org?.plan || 'pro',
  });
}
