import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function getRequestContext() {
  if (process.env.TEST_BYPASS_AUTH === '1') {
    try {
      const cookieStore = await cookies();
      const c = cookieStore.get('__mocksession')?.value;
      if (c) {
        const mock = JSON.parse(decodeURIComponent(c));
        const session = {
          user: { email: mock.email },
          roles: mock.roles,
          orgId: mock.orgId,
        } as any;
        return {
          session,
          orgId: mock.orgId,
          actorEmail: mock.email,
          isAuthed: true,
        };
      }
    } catch {}
  }
  const session = await getServerSession(authOptions);
  return {
    session,
    orgId: (session as any)?.orgId || 'demo',
    actorEmail: (session?.user as any)?.email || 'system',
    isAuthed: !!session,
  };
}
