import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { requireRole } from '@/lib/roles';

type Role = 'EMPLOYEE' | 'MANAGER' | 'OWNER' | 'SUPER_ADMIN';

export async function withGuard(
  req: Request,
  handler: (ctx: { session: any; orgId: string }) => Promise<Response | NextResponse>,
  roles: Role[],
  orgFrom?: (req: Request) => string | null,
) {
  try {
    // Allow demo/mock session via cookies (set by /api/demo/session/start and /api/test/login)
    // This enables API access in the demo without a full NextAuth session
    const cookie = req.headers.get('cookie') || '';
    const demoMatch = /__demosession=([^;]+)/.exec(cookie);
    const mockMatch = /__mocksession=([^;]+)/.exec(cookie);
    let session: any = await getServerSession(authOptions);
    if (!session && demoMatch && mockMatch) {
      try {
        const mock = JSON.parse(decodeURIComponent(mockMatch[1]));
        session = {
          user: { email: mock?.email || 'demo@nextshyft.app', roles: mock?.roles || [] },
          orgId: mock?.orgId || '',
          roles: mock?.roles || [],
        } as any;
      } catch {
        /* ignore */
      }
    }
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const orgId = orgFrom?.(req) || (session as any).orgId;
    requireRole(session as any, orgId, roles);
    return await handler({ session, orgId });
  } catch (e: any) {
    const status = e?.status || 500;
    return NextResponse.json({ error: e?.message || 'Error' }, { status });
  }
}
