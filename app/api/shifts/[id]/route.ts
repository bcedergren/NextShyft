import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Shift from '@/models/Shift';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  await dbConnect();
  const id = params.id;
  const doc = await (Shift as any).findById(id);
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await (Shift as any).deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
