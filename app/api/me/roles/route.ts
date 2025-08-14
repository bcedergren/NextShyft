import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dbConnect } from '@/lib/db';
import User from '@/models/User';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ roles: [] });
  const email = (session.user as any)?.email;
  try {
    await dbConnect();
    const user = await (User as any).findOne({ email }).select('roles');
    const dbRoles = ((user?.roles as any) || []) as string[];
    // Fallback to session roles if DB empty
    const roles = dbRoles.length > 0 ? dbRoles : (((session.user as any)?.roles || []) as string[]);
    return NextResponse.json({ roles });
  } catch {
    const roles = ((session.user as any)?.roles || []) as string[];
    return NextResponse.json({ roles });
  }
}
