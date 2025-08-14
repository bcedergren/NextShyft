
import { NextResponse } from 'next/server';
export async function POST(_: Request, { params }: { params: { id: string } }) {
  // TODO: call ILP scheduler with org policy
  return NextResponse.json({ scheduleId: params.id, status: 'draft', message: 'Generation stub' });
}
