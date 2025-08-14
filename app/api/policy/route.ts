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
  const doc =
    (await (OrgPolicy as any).findOne({ orgId })) || (await (OrgPolicy as any).create({ orgId }));
  return NextResponse.json(doc);
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgId = (session as any).orgId;
  const body = await req.json();
  await dbConnect();
  const doc = await (OrgPolicy as any).findOneAndUpdate(
    { orgId },
    { $set: body },
    { new: true, upsert: true },
  );
  return NextResponse.json(doc);
}
