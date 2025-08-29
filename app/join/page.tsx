'use client';
import AppShell from '@/components/AppShell';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function JoinPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [ok, setOk] = useState<boolean | null>(null);

  const join = async () => {
    const r = await fetch('/api/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    if (r.ok) {
      setOk(true);
    } else {
      setOk(false);
    }
  };

  return (
    <AppShell>
      <Stack spacing={2} sx={{ maxWidth: 520, mx: 'auto', my: 6 }}>
        <Typography variant="h5">Join your workplace</Typography>
        <Paper sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          <TextField label="Work Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Signup Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button variant="contained" onClick={join}>
            Join
          </Button>
          <Button href="/signup" variant="text" sx={{ alignSelf: 'flex-start' }}>
            Want to create a new organization? Sign up here
          </Button>
          {ok === true && <Alert severity="success">Success! Check your email to sign in.</Alert>}
          {ok === false && <Alert severity="error">Invalid code or error. Try again.</Alert>}
        </Paper>
      </Stack>
    </AppShell>
  );
}
