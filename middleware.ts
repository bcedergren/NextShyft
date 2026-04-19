import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';
import { rateLimit } from '@/lib/rateLimit';

// Public routes that should not require authentication
function isPublicPath(pathname: string) {
  return (
    pathname === '/' ||
    pathname.startsWith('/signin') ||
    pathname.startsWith('/accept') ||
    pathname.startsWith('/join') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/reset') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/demo') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/test/login') ||
    pathname.startsWith('/api/test/logout') ||
    pathname.startsWith('/api/signup') ||
    pathname.startsWith('/api/auth/password/forgot') ||
    pathname.startsWith('/api/auth/password/reset') ||
    pathname.startsWith('/api/invites/accept')
  );
}

export default withAuth(
  async function middleware(req: NextRequest) {
    if (process.env.TEST_BYPASS_AUTH === '1' && req.nextUrl.pathname.startsWith('/api/')) {
      const { pathname } = req.nextUrl;
      if (isPublicPath(pathname)) return NextResponse.next();

      const raw = req.cookies.get('__mocksession')?.value;
      if (!raw) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      let roles: string[] = [];
      try {
        const mock = JSON.parse(decodeURIComponent(raw));
        roles = Array.isArray(mock?.roles) ? mock.roles : [];
      } catch {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const hasAnyRole = (...allowed: string[]) => allowed.some((r) => roles.includes(r));
      const isManagerLike = hasAnyRole('MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN');

      if (pathname.startsWith('/api/orgs') || pathname.startsWith('/api/admin/')) {
        if (!roles.includes('SUPERADMIN')) {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else if (pathname.startsWith('/api/audit/export')) {
        if (!isManagerLike) {
          return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else if (
        pathname.startsWith('/api/audit') ||
        pathname.startsWith('/api/shifts/assign') ||
        pathname.startsWith('/api/policy') ||
        pathname.startsWith('/api/availability/all') ||
        pathname.startsWith('/api/invites')
      ) {
        if (!isManagerLike) {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else if (pathname.startsWith('/api/swaps') && req.method === 'PUT') {
        if (!isManagerLike) {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else if (pathname.startsWith('/api/positions') && req.method !== 'GET') {
        if (!isManagerLike) {
          return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // Rate limit non-idempotent requests
    if (!(req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS')) {
      const { ok, headers } = await rateLimit(req, 10, 60_000);
      if (!ok) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: { ...headers, 'Content-Type': 'application/json' },
        });
      }
      const res = NextResponse.next();
      Object.entries(headers).forEach(([k, v]) => res.headers.set(k, v as string));
      return res;
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      // Determine if user is authorized to access this route
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        if (process.env.TEST_BYPASS_AUTH === '1' && pathname.startsWith('/api/')) {
          return true;
        }
        // Allow public demo access when a mock session cookie is present and bypass is enabled
        if (
          process.env.TEST_BYPASS_AUTH === '1' &&
          Boolean(req.cookies.get('__mocksession')?.value)
        ) {
          return true;
        }
        // Enable demo tester auto-login when both demo session and mock session cookies exist
        // This avoids redirecting to /signin after using /api/demo/session/start and /api/test/login
        const hasDemoSession = Boolean(req.cookies.get('__demosession')?.value);
        const hasMockSession = Boolean(req.cookies.get('__mocksession')?.value);
        if (hasDemoSession && hasMockSession) return true;
        if (isPublicPath(pathname)) return true;
        // Require authentication for all matched routes not explicitly public
        return !!token;
      },
    },
  },
);

// Protect key app pages and APIs; allow assets and Next.js internals
export const config = {
  matcher: [
    '/org/:path*',
    '/admin/:path*',
    '/dashboard',
    '/accept',
    '/signin',
    '/reset',
    '/api/:path*',
  ],
};
