import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { Types } from 'mongoose';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json([], { status: 401 });
  const orgId = (session as any).orgId;
  await dbConnect();
  const url = new URL(req.url);
  const positionId = url.searchParams.get('positionId');
  const includeManagers = url.searchParams.get('includeManagers') === '1';
  // Build robust query with $and of independent $or blocks
  const andConds: any[] = [];
  if (orgId) {
    const orgOr: any[] = [{ orgId }];
    if (typeof orgId === 'string' && Types.ObjectId.isValid(orgId)) {
      orgOr.push({ orgId: new Types.ObjectId(orgId) });
    }
    andConds.push({ $or: orgOr });
  }
  if (positionId) {
    // Normalize/cast the position id and robustly match array membership
    const pid = Types.ObjectId.isValid(positionId) ? new Types.ObjectId(positionId) : positionId;
    const posOr: any[] = [];
    // Direct equality on array field (Mongo matches any element)
    posOr.push({ positions: pid });
    // Explicit elemMatch for safety across drivers/serializers
    posOr.push({ positions: { $elemMatch: { $eq: pid } } });
    // Also try string form in case positions were stored as strings
    if (typeof pid !== 'string') {
      posOr.push({ positions: String(positionId) });
    }
    if (includeManagers) posOr.push({ roles: 'MANAGER' });
    andConds.push({ $or: posOr });
  }
  const query = andConds.length ? { $and: andConds } : {};
  const items = await (User as any)
    .find(query)
    .select('email name firstName lastName roles positions');
  return NextResponse.json(items);
}
