
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import Schedule from '@/models/Schedule';
import Notification from '@/models/Notification';
import Swap from '@/models/Swap';

function isSuper(roles: string[]) { return roles.includes('SUPERADMIN') || roles.includes('ADMIN'); }

function dayKey(d: Date) { return d.toISOString().slice(0,10); }

export async function GET() {
  const session = await getServerSession(authOptions);
  const roles = ((session?.user as any)?.roles || []) as string[];
  if (!session || !isSuper(roles)) return NextResponse.json({ error:'Forbidden' }, { status: 403 });
  await dbConnect();

  const [orgs, users, schedules, notifs, swaps] = await Promise.all([
    Org.countDocuments({}),
    User.countDocuments({}),
    Schedule.countDocuments({}),
    Notification.countDocuments({}),
    Swap.countDocuments({}),
  ]);

  const since = new Date(Date.now() - 30*24*60*60*1000);
  const models: any[] = [Org, User, Schedule, Notification, Swap];
  const names = ['orgs','users','schedules','notifications','swaps'];
  const series: Record<string, any[]> = {};
  for (let i=0; i<models.length; i++) {
    const M: any = models[i];
    const name = names[i];
    const rows = await M.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    series[name] = rows.map((r:any)=>({ date: r._id, count: r.count }));
  }

  return NextResponse.json({
    totals: { orgs, users, schedules, notifications: notifs, swaps },
    series,
  });
}
