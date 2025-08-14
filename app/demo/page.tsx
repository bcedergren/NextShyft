'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoRedirect() {
  const router = useRouter();

  useEffect(() => {
    const go = async () => {
      try {
        const demoOrgId = process.env.NEXT_PUBLIC_DEMO_ORG_ID as string | undefined;
        // Set a mock session cookie if bypass is enabled (handled in middleware)
        if (demoOrgId) {
          await fetch(`/api/test/login?email=demo@example.com&roles=OWNER&orgId=${demoOrgId}`, {
            cache: 'no-store',
          });
          router.replace(`/org/${demoOrgId}/dashboard`);
          return;
        }
      } catch {}
      router.replace('/');
    };
    go();
  }, [router]);

  return null;
}


