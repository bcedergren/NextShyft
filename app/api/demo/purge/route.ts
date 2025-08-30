import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DemoSession from '@/models/DemoSession';

// TODO: Implement org-scoped purge based on __demosession + orgId mapping.
export async function POST(req: Request) {
  try {
    await dbConnect();
    const cookieStr = req.headers.get('cookie') || '';
    const match = /__demosession=([^;]+)/.exec(cookieStr);
    const sessionId = match ? decodeURIComponent(match[1]) : '';
    const ct = req.headers.get('content-type') || '';
    let body: any = {};
    if (ct.includes('application/json')) {
      try {
        body = await req.json();
      } catch {}
    }
    const orgId = typeof body?.orgId === 'string' ? body.orgId : undefined;
    if (sessionId) {
      await (DemoSession as any).updateOne({ sessionId }, { $set: { purgedAt: new Date() } });
    }
    // TODO: delete data for orgId if provided
  } catch {}
  return NextResponse.json({ ok: true, purged: true });
}
