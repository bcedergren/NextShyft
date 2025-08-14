import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Audit from '@/models/Audit';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const orgId = (session as any).orgId;
  const action = url.searchParams.get('action') || undefined;
  const since = url.searchParams.get('since')
    ? new Date(url.searchParams.get('since')!)
    : undefined;
  const query: any = { orgId };
  if (action) query.action = action;
  if (since) query.createdAt = { $gte: since };
  const items = await (Audit as any).find(query).sort({ createdAt: -1 }).limit(1000);

  const header = ['createdAt', 'actorEmail', 'action', 'payload'];
  const lines = [header.join(',')];
  for (const a of items) {
    const row = [
      new Date(a.createdAt as any).toISOString(),
      (a.actorEmail || '').replace(/,/g, ' '),
      (a.action || '').replace(/,/g, ' '),
      JSON.stringify(a.payload || {}).replace(/"/g, '""'),
    ];
    lines.push(row.join(','));
  }
  const csv = lines.join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="audit.csv"`,
    },
  });
}
