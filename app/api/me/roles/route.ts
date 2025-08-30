import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export async function GET(req: Request) {
  let session: any = await getServerSession(authOptions);
  if (!session) {
    const cookie = req.headers.get('cookie') || '';
    const demoMatch = /__demosession=([^;]+)/.exec(cookie);
    const mockMatch = /__mocksession=([^;]+)/.exec(cookie);
    if (demoMatch && mockMatch) {
      try {
        const mock = JSON.parse(decodeURIComponent(mockMatch[1]));
        const roles = (mock?.roles as string[]) || [];
        session = { user: { email: mock?.email, roles }, roles } as any;
      } catch {}
    }
  }
  if (!session) return NextResponse.json({ roles: [] });
  const email = (session.user as any)?.email;
  try {
    await dbConnect();
    const user = await (User as any).findOne({ email }).select('roles');
    const dbRoles = ((user?.roles as any) || []) as string[];
    // Fallback to session roles (either user.roles or root roles) if DB empty
    const fallback =
      (((session.user as any)?.roles || []) as string[]).length > 0
        ? (((session.user as any)?.roles || []) as string[])
        : (((session as any)?.roles || []) as string[]);
    const roles = dbRoles.length > 0 ? dbRoles : fallback;
    return NextResponse.json({ roles });
  } catch {
    const roles =
      (((session.user as any)?.roles || []) as string[]).length > 0
        ? (((session.user as any)?.roles || []) as string[])
        : (((session as any)?.roles || []) as string[]);
    return NextResponse.json({ roles });
  }
}
