'use client';
import AppShell from '../../components/AppShell';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { signIn } from 'next-auth/react';

function AcceptInviteInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  useEffect(() => {
    if (!token) return;
    fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async (r) => {
      if (r.ok) {
        setStatus('ok');
        // Attempt one-click sign-in via credentials provider using the invite token
        try {
          const res = await signIn('invite', { token, callbackUrl: '/dashboard', redirect: false });
          // On success, navigate manually to avoid NextAuth default screens
          if ((res as any)?.ok !== false) {
            window.location.href = '/dashboard';
          }
        } catch {}
      } else {
        setStatus('err');
      }
    });
  }, [token]);

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h5">Accept Invite</Typography>
        {status === 'ok' && <Alert severity="success">Invite accepted. Signing you in…</Alert>}
        {status === 'err' && <Alert severity="error">Invite invalid or expired.</Alert>}
        {status === 'idle' && (
          <Paper sx={{ p: 2 }}>
            <Typography>Processing…</Typography>
          </Paper>
        )}
        <Button href="/signin" variant="contained">
          Go to Sign In
        </Button>
      </Stack>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <AppShell>
      <Suspense>
        <AcceptInviteInner />
      </Suspense>
    </AppShell>
  );
}
