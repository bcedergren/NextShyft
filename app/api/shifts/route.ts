import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });
  const url = new URL(req.url);
  const scheduleId = url.searchParams.get('scheduleId');
  await dbConnect();
  const items = await (Shift as any).find({ scheduleId }).sort({ date: 1, start: 1 });
  return NextResponse.json(items);
}
