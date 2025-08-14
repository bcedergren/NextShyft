'use client';
import { Button } from '@mui/material';
import { useEffect, useState } from 'react';

export default function PushOptIn() {
  const [allowed, setAllowed] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setAllowed(Notification.permission);
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.getRegistration().then(async (reg) => {
        try {
          const sub = await reg?.pushManager.getSubscription();
          setSubscribed(!!sub);
        } catch {
          setSubscribed(false);
        }
      });
    }
  }, []);

  const enable = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push not supported');
      return;
    }
    const reg = await navigator.serviceWorker.register('/service-worker.js');
    const perm = await Notification.requestPermission();
    setAllowed(perm);
    if (perm !== 'granted') return;
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as any; // replaced at build
    if (!vapid) {
      alert('Push not configured (missing VAPID key)');
      return;
    }
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid),
    });
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sub.toJSON()),
    });
    if (res.ok) setSubscribed(true);
  };

  // Show button until we have an active subscription
  if (subscribed) return null;
  return (
    <Button variant="outlined" onClick={enable} disabled={allowed === 'denied'}>
      Enable push notifications
    </Button>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}
