import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import Position from '@/models/Position';
import User from '@/models/User';

function hoursBetween(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh + em / 60 - (sh + sm / 60);
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  const url = new URL(req.url);
  const month = url.searchParams.get('month') || new Date().toISOString().slice(0, 7);
  await dbConnect();
  const user = await (User as any).findOne({ email: (session.user as any)?.email });
  if (!user) return new NextResponse('No user', { status: 404 });
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59);
  const shifts = await (Shift as any)
    .find({ 'assignments.userId': String(user._id), date: { $gte: start, $lte: end } })
    .sort({ date: 1, start: 1 });
  const posIds = Array.from(new Set(shifts.map((s: any) => String(s.positionId))));
  const posDocs = await (Position as any).find({ _id: { $in: posIds } });
  const nameMap: any = {};
  posDocs.forEach((p: any) => (nameMap[String(p._id)] = p.name));
  const lines = ['date,start,end,position,hours'];
  for (const s of shifts) {
    const hours = hoursBetween(s.start, s.end).toFixed(2);
    lines.push(
      `${new Date(s.date).toISOString().slice(0, 10)},${s.start},${s.end},${nameMap[String(s.positionId)] || ''},${hours}`,
    );
  }
  const csv = lines.join('\n');
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="hours_${month}.csv"`,
    },
  });
}
