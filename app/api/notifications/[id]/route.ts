
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { getRequestContext } from '@/lib/requestContext';
import { NotificationRepository } from '@/repositories/NotificationRepository';

export async function DELETE(_: Request, { params }: { params: { id: string }}) {
  const { session, isAuthed } = await getRequestContext();
  if (!isAuthed) return NextResponse.json([], { status: 401 });
  await dbConnect();
  const email = (session!.user as any).email;
  const repo = new NotificationRepository();
  await repo.deleteByIdForUser(params.id, email);
  return NextResponse.json({ ok: true });
}
