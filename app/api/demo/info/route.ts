import { NextResponse, NextRequest } from 'next/server';
import { dbConnect } from '@/lib/db';
import DemoSession from '@/models/DemoSession';

export async function GET(req: NextRequest) {
  // Try robust cookie access; fall back to header parsing
  let sessionId = '';
  try {
    const v = req.cookies.get('__demosession')?.value;
    if (v) sessionId = decodeURIComponent(v);
  } catch {}
  if (!sessionId) {
    const cookieStr = req.headers.get('cookie') || '';
    const match = /__demosession=([^;]+)/i.exec(cookieStr);
    sessionId = match ? decodeURIComponent(match[1]) : '';
  }
  if (!sessionId) return NextResponse.json({ ok: false }, { status: 404 });
  await dbConnect();
  const ds = await (DemoSession as any)
    .findOne({ sessionId })
    .select('orgId claimToken expiresAt claimedAt')
    .lean();
  if (!ds) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({
    ok: true,
    orgId: String(ds.orgId || ''),
    claimToken: ds.claimToken || '',
  });
}
