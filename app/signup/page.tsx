'use client';
import AppShell from '@/components/AppShell';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function SignUpPage() {
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const r = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orgName, email, firstName, lastName, password }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) setOk(true);
    else setErr(d.error || 'Signup failed');
  };

  return (
    <AppShell>
      <Stack spacing={2} maxWidth={520} sx={{ mx: 'auto', my: 6 }}>
        <Typography variant="h5">Create your organization</Typography>
        {ok ? (
          <Stack spacing={2}>
            <Alert severity="success">Account created. You can sign in now.</Alert>
            <Button href="/signin" variant="contained">
              Go to Sign In
            </Button>
          </Stack>
        ) : (
          <Paper sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
            <TextField
              label="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <TextField
              label="Your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="contained" onClick={submit}>
              Sign up
            </Button>
            <Button href="/signin" variant="text" sx={{ alignSelf: 'flex-start' }}>
              Already have an account? Sign in
            </Button>
            {err && <Alert severity="error">{err}</Alert>}
          </Paper>
        )}
      </Stack>
    </AppShell>
  );
}
