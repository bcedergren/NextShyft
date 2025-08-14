import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Audit from '@/models/Audit';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const orgId = (session as any).orgId;
  const action = url.searchParams.get('action') || undefined;
  const since = url.searchParams.get('since')
    ? new Date(url.searchParams.get('since')!)
    : undefined;
  const before = url.searchParams.get('before')
    ? new Date(url.searchParams.get('before')!)
    : undefined;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10) || 50, 200);
  const query: any = { orgId };
  if (action) query.action = action;
  if (since && before) query.createdAt = { $gte: since, $lt: before };
  else if (since) query.createdAt = { $gte: since };
  else if (before) query.createdAt = { $lt: before };
  const items = await (Audit as any).find(query).sort({ createdAt: -1 }).limit(limit);
  return NextResponse.json(items);
}
