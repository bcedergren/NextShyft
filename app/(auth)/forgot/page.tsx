'use client';
import AppShell from '@/components/AppShell';
import { Alert, Button, Container, Paper, Stack, TextField, Typography, Box } from '@mui/material';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const valid = email.trim().length > 3 && email.includes('@');

  const submit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch('/api/auth/password/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      // Endpoint always returns ok to avoid enumeration; treat non-2xx as error just in case
      if (res.ok) setMsg('If an account exists for that email, a reset link has been sent.');
      else setErr('Failed to send reset email. Please try again later.');
    } catch {
      setErr('Failed to send reset email. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <Container maxWidth="sm" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            border: '1px solid #f3f4f6',
            borderRadius: 2,
            bgcolor: '#fff',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" sx={{ mt: 1 }}>
              Forgot your password?
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Enter your email address and we’ll send you a link to reset your password.
            </Typography>

            {msg && (
              <Alert severity="success" sx={{ width: '100%' }}>
                {msg}
              </Alert>
            )}
            {err && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {err}
              </Alert>
            )}

            <Box sx={{ width: '100%' }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Box>
            <Button variant="contained" disabled={!valid || submitting} onClick={submit}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>

            <Button href="/signin" variant="text" size="small">
              Back to sign in
            </Button>
          </Stack>
        </Paper>
      </Container>
    </AppShell>
  );
}
