import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';

function isSuper(roles: string[]) {
  return roles.includes('SUPERADMIN') || roles.includes('ADMIN');
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const roles = ((session?.user as any)?.roles || []) as string[];
  if (!session || !isSuper(roles))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await dbConnect();
  const { suspended } = await req.json();
  const patch: any = { suspended: !!suspended };
  if (patch.suspended) patch.suspendedAt = new Date();
  const org = await (Org as any).findByIdAndUpdate(params.id, { $set: patch }, { new: true });
  return NextResponse.json({ ok: true, org });
}
