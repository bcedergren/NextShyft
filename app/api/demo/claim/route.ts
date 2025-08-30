import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DemoSession from '@/models/DemoSession';

export async function POST(req: Request) {
  const url = new URL(req.url);
  const claimToken = url.searchParams.get('claimToken') || '';
  const orgId = url.searchParams.get('orgId') || '';
  if (!claimToken || !orgId) {
    return NextResponse.json({ ok: false, error: 'MISSING_PARAMS' }, { status: 400 });
  }
  await dbConnect();
  const ds = await (DemoSession as any)
    .findOne({ claimToken, orgId })
    .select('_id expiresAt claimedAt');
  if (!ds) return NextResponse.json({ ok: false, error: 'INVALID' }, { status: 404 });
  if (ds.claimedAt)
    return NextResponse.json({ ok: false, error: 'ALREADY_CLAIMED' }, { status: 409 });
  if (ds.expiresAt && ds.expiresAt < new Date())
    return NextResponse.json({ ok: false, error: 'EXPIRED' }, { status: 410 });
  await (DemoSession as any).updateOne({ _id: ds._id }, { $set: { claimedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
