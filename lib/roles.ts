
import { Session } from 'next-auth';

export type Role = 'EMPLOYEE'|'MANAGER'|'OWNER'|'SUPER_ADMIN';

export function hasOrgAccess(session: Session | null, orgId: string) {
  if (!session) return false;
  const sOrg = (session as any).orgId;
  const roles = (session as any).roles as Role[] || [];
  return roles.includes('SUPER_ADMIN') || sOrg === orgId;
}

export function hasAnyRole(session: Session | null, rolesWanted: Role[]) {
  if (!session) return false;
  const roles = (session as any).roles as Role[] || [];
  return roles.includes('SUPER_ADMIN') || roles.some(r => rolesWanted.includes(r));
}

export function requireRole(session: Session | null, orgId: string, rolesWanted: Role[]) {
  if (!hasOrgAccess(session, orgId) || !hasAnyRole(session, rolesWanted)) {
    const err = new Error('Forbidden');
    // @ts-ignore
    err.status = 403;
    throw err;
  }
}
