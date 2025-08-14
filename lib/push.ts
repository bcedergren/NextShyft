import webpush from 'web-push';
import PushSubscription from '@/models/PushSubscription';

export function initPush() {
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const email = process.env.VAPID_CONTACT_EMAIL || 'mailto:admin@nextshyft.app';
  if (pub && priv) {
    webpush.setVapidDetails(email, pub, priv);
    return true;
  }
  return false;
}

export async function sendPushToUsers(emails: string[], payload: any) {
  if (!initPush()) return { ok: false, skipped: 'Missing VAPID keys' };
  const subs = await (PushSubscription as any).find({ userEmail: { $in: emails } });
  const msg = JSON.stringify(payload);
  for (const s of subs) {
    try {
      await webpush.sendNotification(s.subscription as any, msg);
    } catch (e) {
      /* ignore per-sub errors */
    }
  }
  return { ok: true, count: subs.length };
}
