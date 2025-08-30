import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import DemoSession from '@/models/DemoSession';

export async function POST(req: Request) {
  try {
    const cookieStr = req.headers.get('cookie') || '';
    const match = /__demosession=([^;]+)/.exec(cookieStr);
    const sessionId = match ? decodeURIComponent(match[1]) : '';
    if (sessionId) {
      await dbConnect();
      await (DemoSession as any).updateOne({ sessionId }, { $set: { endedAt: new Date() } });
    }
  } catch {}
  const res = NextResponse.json({ ok: true });
  res.headers.append('Set-Cookie', `__demosession=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}
