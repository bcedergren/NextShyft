import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import mongoose from 'mongoose';
import Org from '@/models/Org';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({});
  await dbConnect();
  const orgId = (session as any).orgId;
  let org: any = null;
  try {
    if (orgId && mongoose.isValidObjectId(orgId)) {
      org = await (Org as any).findById(orgId).select('name plan suspended suspendedAt');
    }
  } catch {}
  return NextResponse.json({
    name: org?.name || 'Demo',
    plan: org?.plan || 'pro',
    suspended: !!org?.suspended,
    suspendedAt: org?.suspendedAt || null,
  });
}
