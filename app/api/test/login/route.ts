import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DemoSession from '@/models/DemoSession';
import { encode } from 'next-auth/jwt';

type MockSession = {
  email: string;
  roles: string[];
  orgId: string;
};

function setMockCookie(data: MockSession) {
  const cookieValue = encodeURIComponent(JSON.stringify(data));
  const maxAge = 60 * 60 * 24; // 1 day
  return `__mocksession=${cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

async function setNextAuthCookie(data: MockSession) {
  const maxAge = 60 * 60 * 24; // 1 day
  const secret = process.env.NEXTAUTH_SECRET || 'test-secret';
  const token = await encode({
    secret,
    token: {
      sub: data.email,
      email: data.email,
      orgId: data.orgId,
      roles: data.roles,
    } as any,
    maxAge,
  });
  return `next-auth.session-token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email') || 'e2e@example.com';
  const roles = (url.searchParams.get('roles') || 'OWNER')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  const orgId = url.searchParams.get('orgId') || 'e2e-org';
  // In production, only allow test login if one of the following is true:
  // - Explicit override via ALLOW_DEMO_TEST_LOGIN=1
  // - A demo session cookie exists AND the orgId matches the configured demo org
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_TEST_LOGIN !== '1') {
    const cookieStr = req.headers.get('cookie') || '';
    const match = /__demosession=([^;]+)/.exec(cookieStr);
    const sessionId = match ? decodeURIComponent(match[1]) : '';
    if (!sessionId)
      return NextResponse.json({ ok: false, error: 'TEST_LOGIN_DISABLED' }, { status: 403 });
    await dbConnect();
    const ds = await (DemoSession as any)
      .findOne({ sessionId, orgId, claimedAt: { $exists: false } })
      .select('_id');
    if (!ds) return NextResponse.json({ ok: false, error: 'TEST_LOGIN_DISABLED' }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true, email, roles, orgId });
  res.headers.append('Set-Cookie', setMockCookie({ email, roles, orgId }));
  res.headers.append('Set-Cookie', await setNextAuthCookie({ email, roles, orgId }));
  return res;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<MockSession> | undefined;
    const email = (body?.email && String(body.email)) || 'e2e@example.com';
    const roles = Array.isArray(body?.roles)
      ? body!.roles!.map((r) => String(r))
      : String(body?.roles || 'OWNER')
          .split(',')
          .map((r) => r.trim())
          .filter(Boolean);
    const orgId = (body?.orgId && String(body.orgId)) || 'e2e-org';
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_TEST_LOGIN !== '1') {
      const cookieStr = req.headers.get('cookie') || '';
      const match = /__demosession=([^;]+)/.exec(cookieStr);
      const sessionId = match ? decodeURIComponent(match[1]) : '';
      if (!sessionId)
        return NextResponse.json({ ok: false, error: 'TEST_LOGIN_DISABLED' }, { status: 403 });
      await dbConnect();
      const ds = await (DemoSession as any)
        .findOne({ sessionId, orgId, claimedAt: { $exists: false } })
        .select('_id');
      if (!ds)
        return NextResponse.json({ ok: false, error: 'TEST_LOGIN_DISABLED' }, { status: 403 });
    }
    const res = NextResponse.json({ ok: true, email, roles, orgId });
    res.headers.append('Set-Cookie', setMockCookie({ email, roles, orgId }));
    res.headers.append('Set-Cookie', await setNextAuthCookie({ email, roles, orgId }));
    return res;
  } catch {
    const res = NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
    return res;
  }
}
