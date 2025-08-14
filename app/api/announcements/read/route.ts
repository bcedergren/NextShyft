import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import AnnouncementRead from '@/models/AnnouncementRead';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = (session.user as any)?.email;
  const { id } = await req.json();
  await dbConnect();
  await (AnnouncementRead as any).findOneAndUpdate(
    { announcementId: id, userEmail: email },
    { $set: { orgId: (session as any).orgId } },
    { upsert: true },
  );
  return NextResponse.json({ ok: true });
}
