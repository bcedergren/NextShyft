
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import Schedule from '@/models/Schedule';
import Notification from '@/models/Notification';
import Swap from '@/models/Swap';
import { limitFor } from '@/lib/planLimits';
import Audit from '@/models/Audit';

function isSuper(roles: string[]) { return roles.includes('SUPERADMIN') || roles.includes('ADMIN'); }

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const session = await getServerSession(authOptions);
  const roles = ((session?.user as any)?.roles || []) as string[];
  if (!session || !isSuper(roles)) return NextResponse.json({ error:'Forbidden' }, { status: 403 });
  await dbConnect();
  const org = await (Org as any).findById(params.id);
  if (!org) return NextResponse.json({ error:'Not found' }, { status: 404 });
  const [users, schedules, notifs, swaps] = await Promise.all([
    User.countDocuments({ orgId: String(org._id) }),
    Schedule.countDocuments({ orgId: String(org._id) }),
    Notification.countDocuments({ orgId: String(org._id) }),
    Swap.countDocuments({ orgId: String(org._id) }),
  ]);
  const limit = limitFor(org?.plan).staff;
  const activity = await (Audit as any).find({ orgId: String(org._id) }).sort({ createdAt: -1 }).limit(500);
  return NextResponse.json({ org, stats: { users, schedules, notifications: notifs, swaps }, plan: org.plan || 'pro', seats: { used: users, limit, pct: limit ? users/limit : 0 }, activity });
}
