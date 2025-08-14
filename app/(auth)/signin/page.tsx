'use client';
import AppShell from '../../../components/AppShell';
import { Alert, Button, Stack, TextField, Typography, Box } from '@mui/material';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);
  const params = useSearchParams();
  const callbackUrl = params.get('callbackUrl') || '/dashboard';
  const canSubmit = email.trim().length > 3 && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setErrorMsg(null);
      if (password) {
        const res = await signIn('password', { email, password, callbackUrl, redirect: false });
        if (res?.ok) {
          window.location.href = callbackUrl;
          return;
        }
        await signIn('credentials', { email, password, callbackUrl, redirect: true });
      } else {
        await signIn('email', { email, callbackUrl, redirect: true });
        setSent(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const forgot = async () => {
    if (!email || submitting) return;
    setSubmitting(true);
    setResetMsg(null);
    setResetErr(null);
    try {
      const res = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResetMsg('Password reset link sent. Check your email.');
      } else {
        setResetErr(data?.error || 'Failed to send reset email');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <Stack spacing={2} maxWidth={420} sx={{ mx: 'auto', my: 6 }}>
        <Typography variant="h5">Sign in</Typography>
        {sent && <Alert severity="success">Check your email for a magic link to sign in.</Alert>}
        {resetMsg && <Alert severity="success">{resetMsg}</Alert>}
        {resetErr && <Alert severity="error">{resetErr}</Alert>}
        {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
        />
        <Button variant="contained" disabled={!canSubmit} onClick={submit}>
          Continue
        </Button>
        <Typography variant="caption" color="text.secondary">
          Sign in with password or request a magic link by leaving password blank.
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button onClick={forgot} variant="text" size="small" disabled={!email || submitting}>
            Forgot password?
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button href="/signup" variant="text" size="small">
            Create an account
          </Button>
        </Box>
      </Stack>
    </AppShell>
  );
}
