import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getRequestContext } from '@/lib/requestContext';
import { NotificationRepository } from '@/repositories/NotificationRepository';


export async function GET(req: Request) {
  const { session, isAuthed } = await getRequestContext();
  if (!isAuthed) return NextResponse.json([], { status: 401 });
  await dbConnect();
  const email = (session!.user as any).email;
  const repo = new NotificationRepository();
  const url = new URL(req.url);
  if (url.searchParams.get('unread')) {
    const count = await repo.countUnread(email);
    return NextResponse.json({ count });
  }
  const docs = await repo.listByUser(email);
  return NextResponse.json(docs);
}

export async function PUT() {
  const { session, isAuthed } = await getRequestContext();
  if (!isAuthed) return NextResponse.json([], { status: 401 });
  await dbConnect();
  const email = (session!.user as any).email;
  const repo = new NotificationRepository();
  await repo.markAllRead(email);
  return NextResponse.json({ ok: true });
}
