import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import OrgPolicy from '@/models/OrgPolicy';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const doc = await (OrgPolicy as any).findOne({ orgId });
  return NextResponse.json(doc?.holidays || []);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const body = await req.json();
  const { name, date, type } = body || {};
  if (!name || !date) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  await dbConnect();
  const doc = await (OrgPolicy as any).findOneAndUpdate(
    { orgId },
    { $push: { holidays: { name, date, type: type || 'PAID' } } },
    { new: true, upsert: true },
  );
  return NextResponse.json(doc.holidays || []);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  const name = searchParams.get('name');
  await dbConnect();
  const doc = await (OrgPolicy as any).findOneAndUpdate(
    { orgId },
    { $pull: { holidays: { ...(date ? { date } : {}), ...(name ? { name } : {}) } } },
    { new: true },
  );
  return NextResponse.json(doc?.holidays || []);
}
