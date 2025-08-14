import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import Position from '@/models/Position';
import { withGuard } from '@/lib/apiGuard';

export async function GET(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      await dbConnect();
      const docs = await (Position as any).find({ orgId }).sort({ name: 1 });
      return NextResponse.json(docs);
    },
    ['EMPLOYEE', 'MANAGER', 'OWNER'],
  ); // employees can read
}

export async function POST(req: Request) {
  return withGuard(
    req,
    async ({ orgId }) => {
      const body = await req.json();
      await dbConnect();
      const doc = await (Position as any).create({ orgId, name: body.name });
      return NextResponse.json(doc);
    },
    ['MANAGER', 'OWNER'],
  );
}
