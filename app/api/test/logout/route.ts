import { NextResponse } from 'next/server';

export async function GET() {
  const res = NextResponse.json({ ok: true });
  // Expire the cookie immediately
  res.headers.append('Set-Cookie', `__mocksession=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.headers.append('Set-Cookie', `next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', `__mocksession=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  res.headers.append('Set-Cookie', `next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}
