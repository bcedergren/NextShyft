'use client';
import AppShell from '@/components/AppShell';
import { PageHeader, PageLayout } from '@/components/page';
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import ReplayIcon from '@mui/icons-material/Replay';
import { useEffect, useMemo, useState } from 'react';

interface InviteDoc {
  _id: string;
  email: string;
  role: string;
  status?: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | string;
  createdAt?: string;
}

export default function PeoplePage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');
  const [sending, setSending] = useState(false);

  const [invites, setInvites] = useState<InviteDoc[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>(''); // '', 'PENDING', 'ACCEPTED', 'EXPIRED'

  const filtered = useMemo(() => {
    return invites.filter((x) => {
      if (status && (x.status || '') !== status) return false;
      if (q && !x.email.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [invites, q, status]);

  const loadInvites = async () => {
    setLoading(true);
    try {
      const url = new URL('/api/invites', window.location.origin);
      if (q) url.searchParams.set('q', q);
      if (status) url.searchParams.set('status', status);
      const list = await (await fetch(url.toString(), { cache: 'no-store' })).json();
      setInvites(Array.isArray(list) ? list : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSend = async () => {
    if (!email || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, firstName, lastName }),
      });
      if (res.ok) {
        setEmail('');
        setFirstName('');
        setLastName('');
        setRole('EMPLOYEE');
        await loadInvites();
      }
    } finally {
      setSending(false);
    }
  };

  const resend = async (id: string) => {
    try {
      await fetch(`/api/invites/${id}/resend`, { method: 'POST' });
    } finally {
      await loadInvites();
    }
  };

  return (
    <AppShell>
      <PageLayout spacing={3}>
        <PageHeader
          title="People & Invites"
          subtitle="Invite new team members and manage pending invitations"
          variant="compact"
        />

        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} alignItems="flex-start">
          {/* Invite form */}
          <Paper sx={{ p: 2, width: { xs: '100%', md: 420 } }}>
            <Stack spacing={2}>
              <Typography variant="subtitle1">Send Invite</Typography>
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="small"
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  label="First name (optional)"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  size="small"
                  fullWidth
                />
                <TextField
                  label="Last name (optional)"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Stack>
              <TextField
                select
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                size="small"
                fullWidth
              >
                <MenuItem value="EMPLOYEE">EMPLOYEE</MenuItem>
                <MenuItem value="MANAGER">MANAGER</MenuItem>
              </TextField>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={onSend}
                  startIcon={<SendIcon />}
                  disabled={!email || sending}
                >
                  Send Invite
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RefreshIcon />}
                  onClick={loadInvites}
                >
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Paper>

          {/* Invites list */}
          <Paper sx={{ p: 2, flex: 1, width: '100%' }}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center">
                <TextField
                  label="Search invites"
                  placeholder="email@example.com"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  size="small"
                  sx={{ flex: 1, minWidth: 240 }}
                />
                <TextField
                  select
                  label="Status"
                  size="small"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ width: 180 }}
                >
                  <MenuItem value="">ALL</MenuItem>
                  <MenuItem value="PENDING">PENDING</MenuItem>
                  <MenuItem value="ACCEPTED">ACCEPTED</MenuItem>
                  <MenuItem value="EXPIRED">EXPIRED</MenuItem>
                </TextField>
                <IconButton size="small" onClick={loadInvites} aria-label="Reload invites">
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Stack>

              <Box>
                {loading ? (
                  <Typography color="text.secondary">Loading…</Typography>
                ) : filtered.length === 0 ? (
                  <Typography color="text.secondary">No invites found.</Typography>
                ) : (
                  <Stack spacing={1}>
                    {filtered.map((inv) => (
                      <Stack
                        key={inv._id}
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        alignItems={{ md: 'center' }}
                        sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
                      >
                        <Typography sx={{ width: 280 }}>{inv.email}</Typography>
                        <Chip label={inv.role} size="small" sx={{ width: 120 }} />
                        <Chip
                          label={inv.status || 'PENDING'}
                          color={inv.status === 'ACCEPTED' ? 'success' : inv.status === 'EXPIRED' ? 'default' : 'warning'}
                          size="small"
                          sx={{ width: 120 }}
                        />
                        <Box sx={{ flex: 1 }} />
                        {(inv.status || 'PENDING') === 'PENDING' && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => resend(inv._id)}
                            startIcon={<ReplayIcon />}
                          >
                            Resend
                          </Button>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                )}
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </PageLayout>
    </AppShell>
  );
}
