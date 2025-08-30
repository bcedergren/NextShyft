import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DemoSession from '@/models/DemoSession';
import { createEphemeralDemoOrg } from '@/lib/demoSeed';
import crypto from 'crypto';

export async function POST(req: Request) {
  const sessionId = (globalThis as any).crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  let body: any = {};
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) body = await req.json();
  } catch {}
  await dbConnect();
  const providedOrg = typeof body?.orgId === 'string' ? body.orgId : undefined;
  // Always create a fresh demo org for this session unless a providedOrg is explicitly supplied
  const orgId = providedOrg || (await createEphemeralDemoOrg());
  const claimToken = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
  await (DemoSession as any).create({ sessionId, orgId, claimToken, expiresAt });

  const res = NextResponse.json({ ok: true, orgId, sessionId, claimToken });
  const maxAge = 60 * 60; // 1 hour
  res.headers.append(
    'Set-Cookie',
    `__demosession=${encodeURIComponent(sessionId)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`,
  );
  return res;
}
