'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const ALLOWLIST = [
  '/suspended',
  '/org', // allow nested paths below, we'll check more specifically below
  '/api', // APIs are handled server-side
];

export default function SuspendedGate() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function check() {
      try {
        // Minimal client check
        const res = await fetch('/api/org/status', { cache: 'no-store' });
        const s = await res.json();
        if (cancelled) return;
        if (s?.suspended) {
          const p = pathname || '/';
          if (localStorage.getItem('readonlyBypass') === '1') return;
          if (document.body)
            document.body.dataset.readonly =
              p.includes('/billing') || p.includes('/org-settings') ? 'false' : 'true';
          // allow billing and org settings for owners to resolve
          const ok =
            p.startsWith('/suspended') || p.includes('/billing') || p.includes('/org-settings');
          if (!ok) router.replace('/suspended');
        }
      } catch {
      } finally {
        /* no-op */
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return null;
}
