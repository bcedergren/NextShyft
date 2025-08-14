import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Availability from '@/models/Availability';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({}, { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const docs = await (Availability as any).find({ orgId });
  const map: Record<string, any> = {};
  for (const d of docs) map[d.userEmail] = d.weekly;
  return NextResponse.json(map);
}
