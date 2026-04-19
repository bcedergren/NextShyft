import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';
import { cookies } from 'next/headers';
import Org from '@/models/Org';

export async function requireManager(opts?: { allowWhenSuspended?: boolean }) {
  const bypass = process.env.TEST_BYPASS_AUTH === '1';
  if (bypass) {
    const cookieStore = await cookies();
    const c = cookieStore.get('__mocksession')?.value;
    if (c) {
      try {
        const mock = JSON.parse(decodeURIComponent(c));
        const roles = (mock.roles || []) as string[];
        if (
          !roles.includes('MANAGER') &&
          !roles.includes('OWNER') &&
          !roles.includes('ADMIN') &&
          !roles.includes('SUPERADMIN')
        ) {
          return { ok: false, status: 403, message: 'Forbidden' as const };
        }
        const active = await checkOrgActive({ orgId: mock.orgId } as any, opts?.allowWhenSuspended);
        if (!active.ok) return active as any;
        return {
          ok: true,
          session: { user: { email: mock.email }, roles: mock.roles, orgId: mock.orgId } as any,
        };
      } catch {}
    }
  }
  const session = await getServerSession(authOptions);
  if (!session) return { ok: false, status: 401, message: 'Unauthorized' as const };
  let roles = (((session as any).user as any)?.roles || []) as string[];
  try {
    const email = ((session as any).user as any)?.email;
    const orgId = (session as any)?.orgId;
    if (email && orgId) {
      await dbConnect();
      const u: any = await (User as any).findOne({ orgId, email }).select('roles');
      if (Array.isArray(u?.roles) && u.roles.length > 0) roles = u.roles as string[];
    }
  } catch {}
  if (
    !roles.includes('MANAGER') &&
    !roles.includes('OWNER') &&
    !roles.includes('ADMIN') &&
    !roles.includes('SUPERADMIN')
  ) {
    return { ok: false, status: 403, message: 'Forbidden' as const };
  }
  const active = await checkOrgActive(session, opts?.allowWhenSuspended);
  if (!active.ok) return active as any;
  return { ok: true, session };
}

export async function requireOwner(opts?: { allowWhenSuspended?: boolean }) {
  if (process.env.TEST_BYPASS_AUTH === '1') {
    const cookieStore = await cookies();
    const c = cookieStore.get('__mocksession')?.value;
    if (c) {
      try {
        const mock = JSON.parse(decodeURIComponent(c));
        const roles = (mock.roles || []) as string[];
        if (!roles.includes('OWNER') && !roles.includes('ADMIN') && !roles.includes('SUPERADMIN')) {
          return { ok: false, status: 403, message: 'Forbidden' as const };
        }
        const active = await checkOrgActive({ orgId: mock.orgId } as any, opts?.allowWhenSuspended);
        if (!active.ok) return active as any;
        return {
          ok: true,
          session: { user: { email: mock.email }, roles: mock.roles, orgId: mock.orgId } as any,
        };
      } catch {}
    }
  }
  const { getServerSession } = await import('next-auth');
  const { authOptions } = await import('@/lib/auth');
  const session = await getServerSession(authOptions as any);
  if (!session) return { ok: false, status: 401, message: 'Unauthorized' as const };
  let roles = (((session as any).user as any)?.roles || []) as string[];
  try {
    const email = ((session as any).user as any)?.email;
    const orgId = (session as any)?.orgId;
    if (email && orgId) {
      await dbConnect();
      const u: any = await (User as any).findOne({ orgId, email }).select('roles');
      if (Array.isArray(u?.roles) && u.roles.length > 0) roles = u.roles as string[];
    }
  } catch {}
  if (!roles.includes('OWNER') && !roles.includes('ADMIN') && !roles.includes('SUPERADMIN')) {
    return { ok: false, status: 403, message: 'Forbidden' as const };
  }
  const active = await checkOrgActive(session, opts?.allowWhenSuspended);
  if (!active.ok) return active as any;
  return { ok: true, session };
}

async function checkOrgActive(session: any, allowWhenSuspended?: boolean) {
  try {
    const orgId = (session as any)?.orgId;
    if (!orgId) return { ok: true };
    const org = await (Org as any).findById(orgId).select('suspended');
    if (org?.suspended && !allowWhenSuspended) {
      return { ok: false, status: 423 as const, message: 'Locked (org suspended)' as const };
    }
  } catch {}
  return { ok: true };
}
