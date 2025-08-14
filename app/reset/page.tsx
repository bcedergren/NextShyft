'use client';
import AppShell from '@/components/AppShell';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';

export default function ResetPage() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const router = useRouter();
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'ok' | 'err'>('idle');

  const submit = async () => {
    if (!token || !pwd || pwd !== confirm) return;
    const r = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: pwd }),
    });
    setStatus(r.ok ? 'ok' : 'err');
    if (r.ok) setTimeout(() => router.push('/signin'), 1200);
  };

  return (
    <AppShell>
      <Stack spacing={2} maxWidth={420} sx={{ mx: 'auto', my: 6 }}>
        <Typography variant="h5">Reset Password</Typography>
        {status === 'ok' && <Alert severity="success">Password updated. Redirecting…</Alert>}
        {status === 'err' && <Alert severity="error">Invalid or expired reset link.</Alert>}
        <Paper sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          <TextField
            label="New password"
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            fullWidth
          />
          <TextField
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            fullWidth
            error={confirm.length > 0 && confirm !== pwd}
            helperText={confirm.length > 0 && confirm !== pwd ? 'Passwords do not match' : ''}
          />
          <Button variant="contained" onClick={submit} disabled={!pwd || pwd !== confirm}>
            Update Password
          </Button>
        </Paper>
      </Stack>
    </AppShell>
  );
}
