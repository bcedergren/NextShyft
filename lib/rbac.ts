
import { Session } from 'next-auth';

export function hasRole(session: Session | null, orgId: string, roles: string[]) {
  if (!session) return false;
  const sOrg = (session as any).orgId;
  const sRoles = (session as any).roles || [];
  return sRoles.includes('SUPER_ADMIN') || (sOrg === orgId && roles.some(r => sRoles.includes(r)));
}
