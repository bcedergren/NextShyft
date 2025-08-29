'use client';
import AppShell from '../../../components/AppShell';
import { Alert, Button, Stack, TextField, Typography, Box, Container, Paper } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';

function SignInInner() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetMsg, setResetMsg] = useState<string | null>(null);
  const [resetErr, setResetErr] = useState<string | null>(null);
  const params = useSearchParams();
  const router = useRouter();
  const callbackUrl = params.get('callbackUrl') || '/dashboard';
  const canSubmit = email.trim().length > 3 && email.includes('@') && !submitting;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      setErrorMsg(null);
      if (password) {
        // Try password authentication first
        console.log('[SIGNIN] Attempting password authentication for:', email);
        const res = await signIn('password', { email, password, callbackUrl, redirect: true });
        console.log('[SIGNIN] Password auth result:', res);

        // If we reach here, there was an error (redirect: true should have redirected on success)
        if (res?.error) {
          console.log('[SIGNIN] Password auth error:', res.error);
          setErrorMsg(res.error);
          return;
        }
        // If we reach here without an error, something unexpected happened
        setErrorMsg('Invalid email or password');
      } else {
        // Magic link authentication
        const res = await signIn('email', { email, callbackUrl, redirect: false });
        if (res?.ok) {
          setSent(true);
        } else if (res?.error) {
          setErrorMsg(res.error);
        } else {
          setSent(true);
        }
      }
    } catch (error) {
      console.error('Signin error:', error);
      setErrorMsg('An unexpected error occurred. Please try again.');
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

          <Stack spacing={4} alignItems="center">
            <Typography
              variant="h3"
              fontWeight="300"
              sx={{
                color: '#1f2937',
                fontSize: { xs: '2rem', md: '2.5rem' },
                mt: { xs: 4, md: 2 },
              }}
            >
              Welcome back
            </Typography>

            <Typography
              variant="h6"
              color="#6b7280"
              fontWeight="300"
              align="center"
              sx={{ maxWidth: '400px' }}
            >
              Sign in to your NextShyft account to manage your schedule
            </Typography>

            {sent && (
              <Alert
                severity="success"
                sx={{
                  width: '100%',
                  bgcolor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }}
              >
                Check your email for a magic link to sign in.
              </Alert>
            )}
            {resetMsg && (
              <Alert
                severity="success"
                sx={{
                  width: '100%',
                  bgcolor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }}
              >
                {resetMsg}
              </Alert>
            )}
            {resetErr && (
              <Alert
                severity="error"
                sx={{
                  width: '100%',
                  bgcolor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }}
              >
                {resetErr}
              </Alert>
            )}
            {errorMsg && (
              <Alert
                severity="error"
                sx={{
                  width: '100%',
                  bgcolor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }}
              >
                {errorMsg}
              </Alert>
            )}

            <Stack spacing={3} sx={{ width: '100%' }}>
              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: '#374151',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Email
                </Typography>
                <TextField
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  placeholder="Enter your email address"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fff',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1f2937',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#1f2937',
                    },
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color: '#374151',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                  }}
                >
                  Password
                </Typography>
                <TextField
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  placeholder="Enter your password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      bgcolor: '#fff',
                      '& fieldset': {
                        borderColor: '#d1d5db',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9ca3af',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#1f2937',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#1f2937',
                    },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                disabled={!canSubmit}
                onClick={submit}
                sx={{
                  bgcolor: '#1f2937',
                  '&:hover': { bgcolor: '#111827' },
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '1.1rem',
                }}
              >
                {submitting ? 'Signing in...' : 'Continue'}
              </Button>
            </Stack>

            <Typography
              variant="body2"
              color="#6b7280"
              fontWeight="300"
              align="center"
              sx={{ maxWidth: '400px' }}
            >
              Sign in with password or request a magic link by leaving password blank.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'space-between' }}>
              <Button
                onClick={forgot}
                variant="text"
                size="small"
                disabled={!email || submitting}
                sx={{ color: '#6b7280', fontWeight: 400 }}
              >
                Forgot password?
              </Button>
              <Button
                href="/signup"
                variant="text"
                size="small"
                sx={{ color: '#1f2937', fontWeight: 500 }}
              >
                Create an account
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </AppShell>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}
