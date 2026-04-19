import { getServerSession, NextAuthOptions } from 'next-auth';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import clientPromise from './mongoClient';
import EmailProvider from 'next-auth/providers/email';
import Credentials from 'next-auth/providers/credentials';
import { Resend } from 'resend';
import { dbConnect } from '@/lib/db';
import Invite from '@/models/Invite';
import User from '@/models/User';
import crypto from 'crypto';

async function sendWithResend(email: string, url: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'noreply@nextshyft.app';
  if (!apiKey) {
    console.warn('RESEND_API_KEY missing. Logging magic link for development.');
    console.info(`[DEV ONLY] Magic link for ${email}: ${url}`);
    return;
  }
  const resend = new Resend(apiKey);
  await resend.emails.send({
    from,
    to: email,
    subject: 'Sign in to NextShyft',
    html: `<p>Click to sign in:</p><p><a href="${url}">${url}</a></p>`,
  });
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    EmailProvider({
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendWithResend(identifier, url);
      },
    } as any),
    // Standard email + password sign-in using DB passwordHash
    Credentials({
      id: 'password',
      name: 'Password',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        try {
          const email = String((creds as any)?.email || '').toLowerCase();
          const password = String((creds as any)?.password || '');
          if (!email || !password) return null;

          console.log(`[AUTH] Attempting password auth for email: ${email}`);

          await dbConnect();
          const u: any = await (User as any)
            .findOne({ email })
            .select('email orgId roles passwordHash');

          if (!u) {
            console.log(`[AUTH] User not found for email: ${email}`);
            return null;
          }

          if (!u.passwordHash) {
            console.log(`[AUTH] User found but no password hash for email: ${email}`);
            return null;
          }

          const hash = crypto.createHash('sha256').update(password).digest('hex');
          const passwordMatch = hash === u.passwordHash;

          console.log(`[AUTH] Password match: ${passwordMatch} for email: ${email}`);

          if (!passwordMatch) return null;

          return {
            id: String(u._id),
            email: u.email,
            orgId: String(u.orgId || ''),
            roles: u.roles || ['EMPLOYEE'],
          } as any;
        } catch (error) {
          console.error('[AUTH] Error in password authorize:', error);
          return null;
        }
      },
    } as any),
    // One-click login using invite token after acceptance
    Credentials({
      id: 'invite',
      name: 'Invite',
      credentials: {
        token: { label: 'Token', type: 'text' },
      },
      async authorize(creds) {
        try {
          const token = String((creds as any)?.token || '');
          if (!token) return null;
          await dbConnect();
          const invite: any = await (Invite as any).findOne({ token });
          if (!invite || invite.status !== 'ACCEPTED') return null;
          return {
            id: invite.email,
            email: invite.email,
            orgId: String(invite.orgId),
            roles: [invite.role || 'EMPLOYEE'],
          } as any;
        } catch {
          return null;
        }
      },
    } as any),
    ...(process.env.TEST_BYPASS_AUTH === '1'
      ? [
          Credentials({
            name: 'Credentials',
            credentials: {
              email: { label: 'Email', type: 'text' },
              password: { label: 'Password', type: 'password' },
            },
            async authorize(creds) {
              const ok =
                creds?.email === process.env.TEST_EMAIL &&
                creds?.password === process.env.TEST_PASSWORD;
              if (!ok) return null;
              return { id: 'test-user', email: creds!.email } as any;
            },
          } as any),
        ]
      : []),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).orgId = (user as any).orgId || (token as any).orgId || '';
        (token as any).roles = (user as any).roles || (token as any).roles || ['EMPLOYEE'];
      }
      if (process.env.TEST_BYPASS_AUTH === '1') {
        const rolesCsv = process.env.TEST_ROLES || 'OWNER';
        (token as any).orgId = process.env.TEST_ORG_ID || (process.env.SEED_ORG_ID as string) || '';
        (token as any).roles = rolesCsv.split(',').map((r: string) => r.trim());
      }
      (token as any).orgId = (token as any).orgId || '';
      (token as any).roles = (token as any).roles || ['EMPLOYEE'];
      return token;
    },
    async session({ session, token }) {
      (session as any).orgId = (token as any).orgId;
      (session as any).roles = (token as any).roles;
      return session;
    },
  },
};
export const getSession = () => getServerSession(authOptions);
