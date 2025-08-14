
import { NextRequest, NextResponse } from 'next/server';

type Key = string;
type WindowMs = number;
type Limit = number;

let memoryStore: Map<Key, { tokens: number; reset: number }> = new Map();

function getClientKey(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || (req as any).ip
      || 'unknown';
}

async function upstashLimit(key: string, limit: number, windowSec: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  // Use a naive fixed window counter with EXPIRE
  const id = `rl:${key}:${Math.floor(Date.now()/1000/windowSec)}`;
  const res = await fetch(`${url}/incr/${id}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const n = await res.json();
  if (n === 1) {
    await fetch(`${url}/expire/${id}/` + (windowSec+1), { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  }
  return { count: Number(n), remaining: Math.max(0, limit - Number(n)), reset: Math.ceil(Date.now()/1000/windowSec)*windowSec };
}

export async function rateLimit(req: NextRequest, limit: Limit, windowMs: WindowMs) {
  const key = getClientKey(req) + ':' + (req.nextUrl.pathname || 'any');
  // Try Upstash first
  const up = await upstashLimit(key, limit, Math.ceil(windowMs/1000));
  if (up) {
    const ok = up.count <= limit;
    return { ok, headers: { 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(Math.max(0, up.remaining)), 'X-RateLimit-Reset': String(up.reset) } };
  }
  // In-memory fallback
  const now = Date.now();
  const row = memoryStore.get(key) || { tokens: limit, reset: now + windowMs };
  if (now > row.reset) {
    row.tokens = limit - 1;
    row.reset = now + windowMs;
  } else {
    row.tokens = Math.max(0, row.tokens - 1);
  }
  memoryStore.set(key, row);
  const ok = row.tokens > 0;
  return { ok, headers: { 'X-RateLimit-Limit': String(limit), 'X-RateLimit-Remaining': String(Math.max(0, row.tokens - 1)), 'X-RateLimit-Reset': String(Math.floor(row.reset/1000)) } };
}
