import { dbConnect } from '@/lib/db';
import Org from '@/models/Org';

export async function createEphemeralDemoOrg(baseName = 'Demo Org') {
  await dbConnect();
  const now = Date.now();
  const name = `${baseName} ${new Date(now).toISOString().substring(0, 10)} ${now % 10000}`;
  const org = await (Org as any).create({ name, plan: 'free', isDemo: true });
  return String(org._id);
}
