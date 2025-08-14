import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import ShiftTemplate from '@/models/ShiftTemplate';
import { withGuard } from '@/lib/apiGuard';

export async function GET(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      await dbConnect();
      const docs = await (ShiftTemplate as any).find({ orgId }).sort({ dayOfWeek: 1, start: 1 });
      return NextResponse.json(docs);
    },
    ['EMPLOYEE', 'MANAGER', 'OWNER'],
  );
}

export async function POST(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      const body = await req.json();
      await dbConnect();
      const doc = await (ShiftTemplate as any).create({ ...body, orgId });
      return NextResponse.json(doc);
    },
    ['MANAGER', 'OWNER'],
  );
}
