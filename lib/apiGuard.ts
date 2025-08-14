
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/roles';

type Role = 'EMPLOYEE'|'MANAGER'|'OWNER'|'SUPER_ADMIN';

export async function withGuard(
  req: Request, 
  handler: (ctx: { session: any, orgId: string }) => Promise<Response | NextResponse>,
  roles: Role[],
  orgFrom?: (req: Request) => string | null
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const orgId = orgFrom?.(req) || (session as any).orgId;
    requireRole(session as any, orgId, roles);
    return await handler({ session, orgId });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: e?.message || 'Error' }, { status });
  }
}
