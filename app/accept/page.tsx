'use client';
import AppShell from '../../components/AppShell';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Paper, Stack, Typography, TextField } from '@mui/material';
import { signIn } from 'next-auth/react';

function AcceptInviteInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err' | 'password'>('idle');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch('/api/invites/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    }).then(async (r) => {
      if (r.ok) {
        const data = await r.json();
        if (data.needsPassword) {
          setStatus('password');
        } else {
          setStatus('ok');
          // Attempt one-click sign-in via credentials provider using the invite token
          try {
            const res = await signIn('invite', {
              token,
              callbackUrl: '/dashboard',
              redirect: false,
            });
            // On success, navigate manually to avoid NextAuth default screens
            if ((res as any)?.ok !== false) {
              window.location.href = '/dashboard';
            }
          } catch {}
        }
      } else {
        setStatus('err');
      }
    });
  }, [token]);

  const createPassword = async () => {
    if (!password || !firstName || !lastName) return;

    setProcessing(true);
    try {
      const r = await fetch('/api/invites/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, firstName, lastName }),
      });

      if (r.ok) {
        setStatus('ok');
        // Attempt sign-in with the new credentials
        try {
          const res = await signIn('credentials', {
            email: '', // Will be filled by the API
            password,
            callbackUrl: '/dashboard',
            redirect: false,
          });
          if ((res as any)?.ok !== false) {
            window.location.href = '/dashboard';
          }
        } catch {}
      } else {
        setStatus('err');
      }
    } catch (e) {
      setStatus('err');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="h5">Accept Invite</Typography>

        {status === 'password' && (
          <Paper sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Please complete your account setup to join the organization.
            </Typography>
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              variant="contained"
              onClick={createPassword}
              disabled={!password || !firstName || !lastName || processing}
            >
              {processing ? 'Creating Account...' : 'Complete Setup'}
            </Button>
          </Paper>
        )}

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
