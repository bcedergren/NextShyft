import type { NextAuthOptions } from 'next-auth';

export default {
  pages: { signIn: '/signin' },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        (token as any).orgId = (user as any).orgId || (token as any).orgId || '';
        (token as any).roles = (user as any).roles || (token as any).roles || ['EMPLOYEE'];
      }
      if (!user && process.env.TEST_BYPASS_AUTH === '1') {
        const rolesCsv = process.env.TEST_ROLES || 'OWNER';
        (token as any).orgId = process.env.TEST_ORG_ID || (process.env.SEED_ORG_ID as string) || '';
        (token as any).roles = rolesCsv.split(',').map((r: string) => r.trim());
      }
      (token as any).orgId = (token as any).orgId || '';
      (token as any).roles = (token as any).roles || ['EMPLOYEE'];
      return token;
    },
    session({ session, token }) {
      (session as any).orgId = (token as any).orgId;
      (session as any).roles = (token as any).roles;
      return session;
    },
  },
} satisfies NextAuthOptions;
