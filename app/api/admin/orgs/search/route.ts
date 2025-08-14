import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';
import User from '@/models/User';
import { limitFor } from '@/lib/planLimits';

function isSuper(roles: string[]) {
  return roles.includes('SUPERADMIN') || roles.includes('ADMIN');
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const roles = ((session?.user as any)?.roles || []) as string[];
  if (!session || !isSuper(roles))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const url = new URL(req.url);
  const q = (url.searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json([]);
  const orgs = await (Org as any).find({ name: { $regex: q, $options: 'i' } }).limit(20);
  const ids = orgs.map((o: any) => String(o._id));
  const counts = await User.aggregate([
    { $match: { orgId: { $in: ids } } },
    { $group: { _id: '$orgId', c: { $sum: 1 } } },
  ]);
  const cMap: Record<string, number> = {};
  counts.forEach((r: any) => (cMap[String(r._id)] = r.c));
  const out = orgs.map((o: any) => {
    const plan = o.plan || 'pro';
    const used = cMap[String(o._id)] || 0;
    const limit = limitFor(plan).staff;
    return {
      id: String(o._id),
      name: o.name,
      plan,
      seats: { used, limit, pct: limit ? used / limit : 0 },
    };
  });
  return NextResponse.json(out);
}
