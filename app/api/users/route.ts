import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const items = await (User as any)
    .find({ orgId })
    .select('email name firstName lastName roles positions');
  return NextResponse.json(items);
}
