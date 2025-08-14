import { NextResponse } from 'next/server';

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email') || 'e2e@example.com';
  const roles = (url.searchParams.get('roles') || 'OWNER')
    .split(',')
    .map((r) => r.trim())
    .filter(Boolean);
  const orgId = url.searchParams.get('orgId') || 'e2e-org';
  const res = NextResponse.json({ ok: true, email, roles, orgId });
  res.headers.append('Set-Cookie', setMockCookie({ email, roles, orgId }));
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
    const res = NextResponse.json({ ok: true, email, roles, orgId });
    res.headers.append('Set-Cookie', setMockCookie({ email, roles, orgId }));
    return res;
  } catch {
    const res = NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
    return res;
  }
}
