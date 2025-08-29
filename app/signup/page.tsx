'use client';
import AppShell from '@/components/AppShell';
import {
  Alert,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Container,
  Box,
} from '@mui/material';
import { useState } from 'react';

export default function SignUpPage() {
  const [mode, setMode] = useState<'new' | 'join'>('new');
  const [plan, setPlan] = useState<'free' | 'pro' | 'business'>('free');
  const [orgName, setOrgName] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    console.log('Submit called with mode:', mode);

    if (mode === 'new') {
      console.log('Creating new organization...');
      const r = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName, email, firstName, lastName, password, plan }),
      });
      const d = await r.json().catch(() => ({}));
      console.log('Signup response:', r.status, d);
      if (r.ok) {
        // If server returns a checkout URL for paid plans, redirect there.
        if (d.checkoutUrl) {
          window.location.href = d.checkoutUrl as string;
          return;
        }
        setOk(true);
      } else setErr(d.error || 'Signup failed');
    } else {
      console.log('Joining with code...', { email, code, firstName, lastName, password });
      const r = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, firstName, lastName, password }),
      });
      const d = await r.json().catch(() => ({}));
      console.log('Join response:', r.status, d);
      if (r.ok) {
        if (d.directJoin) {
          setOk(true);
        } else {
          // Fallback to invite flow
          setOk(true);
        }
      } else {
        setErr(d.error || 'Join failed');
      }
    }
  };

  const handleModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newMode: 'new' | 'join' | null,
  ) => {
    if (newMode !== null) {
      setMode(newMode);
      setErr(null);
      setOk(null);
    }
  };

  return (
    <AppShell>
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper
          sx={{
            p: { xs: 4, md: 6 },
            border: '1px solid #f3f4f6',
            borderRadius: 2,
            bgcolor: '#fff',
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
              Get Started with NextShyft
            </Typography>

            <ToggleButtonGroup
              value={mode}
              exclusive
              onChange={handleModeChange}
              aria-label="signup mode"
              sx={{
                alignSelf: 'center',
                '& .MuiToggleButton-root': {
                  borderColor: '#d1d5db',
                  color: '#6b7280',
                  fontWeight: 400,
                  '&.Mui-selected': {
                    bgcolor: '#1f2937',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#111827',
                    },
                  },
                  '&:hover': {
                    bgcolor: '#f9fafb',
                  },
                },
              }}
            >
              <ToggleButton value="new" aria-label="create new organization">
                Create New Organization
              </ToggleButton>
              <ToggleButton value="join" aria-label="join existing organization">
                Join with Code
              </ToggleButton>
            </ToggleButtonGroup>

            {mode === 'new' && (
              <Typography
                variant="body2"
                color="#6b7280"
                fontWeight="300"
                textAlign="center"
                sx={{ maxWidth: '400px' }}
              >
                Create a new organization and become its owner
              </Typography>
            )}

            {mode === 'join' && (
              <Typography
                variant="body2"
                color="#6b7280"
                fontWeight="300"
                textAlign="center"
                sx={{ maxWidth: '400px' }}
              >
                Join an existing organization using an invite code
              </Typography>
            )}

            {err && (
              <Alert
                severity="error"
                sx={{
                  width: '100%',
                  bgcolor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                }}
              >
                {err}
              </Alert>
            )}

            {ok && (
              <Alert
                severity="success"
                sx={{
                  width: '100%',
                  bgcolor: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                }}
              >
                Account created successfully! You can now sign in.
              </Alert>
            )}

            <Stack spacing={3} sx={{ width: '100%', maxWidth: '640px' }}>
              {mode === 'new' && (
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
                    Organization Name
                  </Typography>
                  <TextField
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    fullWidth
                    placeholder="Enter organization name"
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
              )}

              {mode === 'new' && (
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ mb: 1, color: '#374151', fontWeight: 500, fontSize: '0.875rem' }}
                  >
                    Choose a plan
                  </Typography>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Paper
                      role="button"
                      onClick={() => setPlan('free')}
                      elevation={plan === 'free' ? 4 : 1}
                      sx={{
                        p: 2,
                        flex: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: plan === 'free' ? '2px solid #1f2937' : '1px solid #e5e7eb',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          Free
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          $0/mo
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Up to 5 staff
                      </Typography>
                    </Paper>
                    <Paper
                      role="button"
                      onClick={() => setPlan('pro')}
                      elevation={plan === 'pro' ? 4 : 1}
                      sx={{
                        p: 2,
                        flex: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: plan === 'pro' ? '2px solid #1f2937' : '1px solid #e5e7eb',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          Pro
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          $49/mo
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Up to 25 staff
                      </Typography>
                    </Paper>
                    <Paper
                      role="button"
                      onClick={() => setPlan('business')}
                      elevation={plan === 'business' ? 4 : 1}
                      sx={{
                        p: 2,
                        flex: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: plan === 'business' ? '2px solid #1f2937' : '1px solid #e5e7eb',
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          Business
                        </Typography>
                        <Typography variant="subtitle2" color="text.secondary">
                          $99/mo
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Unlimited staff
                      </Typography>
                    </Paper>
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    You can change plans anytime. Paid plans will take you to checkout after signup.
                  </Typography>
                </Box>
              )}

              {mode === 'join' && (
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
                    Invite Code
                  </Typography>
                  <TextField
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    fullWidth
                    placeholder="Enter your invite code"
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
              )}

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

              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      color: '#374151',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    First Name
                  </Typography>
                  <TextField
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    fullWidth
                    placeholder="Enter first name"
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
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 1,
                      color: '#374151',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                    }}
                  >
                    Last Name
                  </Typography>
                  <TextField
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    fullWidth
                    placeholder="Enter last name"
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
              </Stack>

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
                {mode === 'new' ? 'Create Account' : 'Join Organization'}
              </Button>
            </Stack>

            <Typography
              variant="body2"
              color="#6b7280"
              fontWeight="300"
              align="center"
              sx={{ maxWidth: '400px' }}
            >
              Already have an account?{' '}
              <Button
                href="/signin"
                variant="text"
                size="small"
                sx={{ color: '#1f2937', fontWeight: 500 }}
              >
                Sign in
              </Button>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </AppShell>
  );
}
