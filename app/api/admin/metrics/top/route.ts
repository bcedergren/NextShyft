
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import Schedule from '@/models/Schedule';
import Notification from '@/models/Notification';
import { limitFor } from '@/lib/planLimits';

function isSuper(roles: string[]) { return roles.includes('SUPERADMIN') || roles.includes('ADMIN'); }

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const roles = ((session?.user as any)?.roles || []) as string[];
  if (!session || !isSuper(roles)) return NextResponse.json({ error:'Forbidden' }, { status: 403 });
  await dbConnect();

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') || 10);

  // Top orgs by user count
  const orgAgg = await User.aggregate([
    { $group: { _id: "$orgId", users: { $sum: 1 } } },
    { $sort: { users: -1 } },
    { $limit: limit }
  ]);
  const orgIds = orgAgg.map((o:any)=>o._id);
  const orgDocs = await (Org as any).find({ _id: { $in: orgIds } });
  const orgMap = Object.fromEntries(orgDocs.map((o:any)=>[String(o._id), o.name || 'Unnamed']));

  // Last active per org (last schedule or notification)
  const lastSched = await Schedule.aggregate([
    { $group: { _id: "$orgId", last: { $max: "$createdAt" } } }
  ]);
  const lastNotifs = await Notification.aggregate([
    { $group: { _id: "$orgId", last: { $max: "$createdAt" } } }
  ]);
  const lastMap: Record<string, Date> = {};
  for (const r of lastSched) lastMap[String(r._id)] = new Date(r.last);
  for (const r of lastNotifs) {
    const k = String(r._id);
    lastMap[k] = new Date(Math.max(lastMap[k]?.getTime() || 0, new Date(r.last).getTime()));
  }

  const topOrgs = orgAgg.map((o:any)=>{ const doc:any = orgDocs.find((d:any)=>String(d._id)===String(o._id)); const plan = (doc?.plan) || 'pro'; const limit = limitFor(plan).staff; const suspended = !!doc?.suspended; return { orgId: String(o._id), name: orgMap[String(o._id)] || 'Unknown', users: o.users, lastActive: lastMap[String(o._id)] || null, plan, seats: { used: o.users, limit, pct: limit ? o.users/limit : 0 }, suspended }; });

  // Top active users by notifications (last 30d)
  const since = new Date(Date.now() - 30*24*60*60*1000);
  const userAgg = await Notification.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: "$userEmail", notifs: { $sum: 1 } } },
    { $sort: { notifs: -1 } },
    { $limit: limit }
  ]);

  return NextResponse.json({ topOrgs, topUsers: userAgg });
}
