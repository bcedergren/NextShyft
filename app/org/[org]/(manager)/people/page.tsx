'use client';
import RoleEditor from '@/components/RoleEditor';
import LimitMeter from '@/components/LimitMeter';
import PlanGuard from '@/components/PlanGuard';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Tooltip,
  Select,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useToast } from '@/components/ToastProvider';

export default function PeoplePage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [limits, setLimits] = useState<any>(null);
  const [msg, setMsg] = useState<string>('');
  const [invites, setInvites] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [status, setStatus] = useState('');
  const toast = useToast();
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [confirmCancelEmail, setConfirmCancelEmail] = useState<string>('');
  const [confirmResendId, setConfirmResendId] = useState<string | null>(null);
  const [confirmResendEmail, setConfirmResendEmail] = useState<string>('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<null | any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  const load = async () => {
    setLoading(true);
    setUsersLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    const [invRes, usersRes] = await Promise.all([
      fetch('/api/invites' + (params.toString() ? `?${params.toString()}` : '')),
      fetch('/api/users'),
    ]);
    const inv = await invRes.json();
    const usr = await usersRes.json();
    const qLower = (q || '').toLowerCase();
    const filteredUsers = qLower
      ? usr.filter((u: any) => {
          const full = [u.firstName, u.lastName].filter(Boolean).join(' ');
          return (
            (full || u.name || '').toLowerCase().includes(qLower) ||
            (u.email || '').toLowerCase().includes(qLower)
          );
        })
      : usr;
    setInvites(inv);
    setUsers(filteredUsers);
    setLoading(false);
    setUsersLoading(false);
  };
  useEffect(() => {
    fetch('/api/org/limits')
      .then((r) => r.json())
      .then(setLimits);
    fetch('/api/positions')
      .then((r) => r.json())
      .then(setPositions)
      .catch(() => setPositions([]));
    load();
  }, []);

  const sendInvite = async () => {
    await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, firstName, lastName }),
    });
    setEmail('');
    setRole('EMPLOYEE');
    setFirstName('');
    setLastName('');
    load();
  };

  const cancelInvite = async (id: string) => {
    await fetch(`/api/invites/${id}`, { method: 'DELETE' });
    setMsg('Invite cancelled');
    toast('Invite cancelled', 'success');
    load();
    setTimeout(() => setMsg(''), 2000);
  };
  const resendInvite = async (id: string) => {
    await fetch(`/api/invites/${id}/resend`, { method: 'POST' });
    setMsg('Invite resent');
    toast('Invite resent', 'success');
    load();
    setTimeout(() => setMsg(''), 2000);
  };

  const deleteInvite = async (id: string) => {
    try {
      await fetch(`/api/invites/${id}`, { method: 'DELETE' });
    } finally {
      setInvites((prev) => prev.filter((x) => x._id !== id));
      setMsg('Invite removed');
      toast('Invite removed', 'success');
      setTimeout(() => setMsg(''), 2000);
    }
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <RoleEditor />
        <PlanGuard />
        <LimitMeter />
        <PlanGuard />
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h5">People & Invites</Typography>
          <Button variant="contained" onClick={() => setInviteOpen(true)}>
            Send Invite
          </Button>
        </Stack>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 200px 120px' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') load();
            }}
            fullWidth
          />
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
            fullWidth
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="ACCEPTED">Accepted</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
            <MenuItem value="EXPIRED">Expired</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={load} fullWidth>
            Apply
          </Button>
        </Paper>

        {/* Users list */}
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Users
          </Typography>
          {usersLoading ? (
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
            </Stack>
          ) : users.length === 0 ? (
            <Typography color="text.secondary">No users.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'grid' },
                  gridTemplateColumns: '1.6fr 1.6fr 1fr auto',
                  gap: 1,
                  py: 1,
                  color: 'text.secondary',
                  fontSize: 12,
                }}
              >
                <Typography>Name</Typography>
                <Typography>Email</Typography>
                <Typography>Roles</Typography>
                <Typography>Actions</Typography>
              </Box>
              {users.map((u) => (
                <Box
                  key={u._id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1.6fr 1.6fr 1fr auto' },
                    gap: 1,
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    alignItems: 'center',
                  }}
                >
                  <Typography>
                    {[u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || '—'}
                  </Typography>
                  <Typography>{u.email}</Typography>
                  <Typography color="text.secondary">{(u.roles || []).join(', ')}</Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}
                  >
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        onClick={() => setEditOpen({ ...u })}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              ))}
            </>
          )}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Pending Invites
          </Typography>
          {msg && (
            <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
              {msg}
            </Typography>
          )}
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
            </Stack>
          ) : invites.filter((x: any) => x.status === 'PENDING').length === 0 ? (
            <Typography color="text.secondary">No pending invites.</Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: { xs: 'none', sm: 'grid' },
                  gridTemplateColumns: '2fr 1.2fr 1fr 1.5fr 1fr auto',
                  gap: 1,
                  py: 1,
                  color: 'text.secondary',
                  fontSize: 12,
                }}
              >
                <Typography>Email</Typography>
                <Typography>Name</Typography>
                <Typography>Role</Typography>
                <Typography>Created</Typography>
                <Typography>Status</Typography>
                <Typography>Actions</Typography>
              </Box>
              {invites
                .filter((x: any) => x.status === 'PENDING')
                .map((i) => (
                  <Box
                    key={i._id}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: '2fr 1.2fr 1fr 1.5fr 1fr auto',
                      },
                      gap: 1,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      alignItems: 'center',
                    }}
                  >
                    <Typography>{i.email}</Typography>
                    <Typography>{[i.firstName, i.lastName].filter(Boolean).join(' ')}</Typography>
                    <Typography>{i.role}</Typography>
                    <Typography color="text.secondary">
                      {new Date(i.createdAt).toLocaleString?.() || ''}
                    </Typography>
                    <Typography color="text.secondary">{i.status}</Typography>
                    {i.status === 'PENDING' ? (
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}
                      >
                        <Tooltip title="Edit">
                          <IconButton color="primary" onClick={() => setEditOpen(i)} size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Resend">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setConfirmResendId(i._id);
                              setConfirmResendEmail(i.email);
                            }}
                            size="small"
                          >
                            <ReplayIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            color="error"
                            onClick={() => {
                              setConfirmCancelId(i._id);
                              setConfirmCancelEmail(i.email);
                            }}
                            size="small"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => deleteInvite(i._id)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                ))}
            </>
          )}
        </Paper>
        <Dialog open={!!confirmCancelId} onClose={() => setConfirmCancelId(null)}>
          <DialogTitle>Cancel invite?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to cancel the invite
              {confirmCancelEmail ? ` for ${confirmCancelEmail}` : ''}? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmCancelId(null)}>No</Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                if (confirmCancelId) await cancelInvite(confirmCancelId);
                setConfirmCancelId(null);
                setConfirmCancelEmail('');
              }}
            >
              Yes, cancel
            </Button>
          </DialogActions>
        </Dialog>
        {/* Invite modal */}
        <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Send Invite</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
              <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={limits?.atLimit}
              onClick={async () => {
                await sendInvite();
                setInviteOpen(false);
              }}
            >
              Send Invite
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit invite/user modal */}
        <Dialog open={!!editOpen} onClose={() => setEditOpen(null)} fullWidth maxWidth="sm">
          <DialogTitle>{editOpen?.status ? 'Edit Invite' : 'Edit User'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="First name"
                value={editOpen?.firstName || ''}
                onChange={(e) => setEditOpen((p: any) => ({ ...p, firstName: e.target.value }))}
              />
              <TextField
                label="Last name"
                value={editOpen?.lastName || ''}
                onChange={(e) => setEditOpen((p: any) => ({ ...p, lastName: e.target.value }))}
              />
              <TextField
                select
                label="Role"
                value={
                  editOpen?.role ||
                  ((editOpen?.roles || []).includes('MANAGER') ? 'MANAGER' : 'EMPLOYEE')
                }
                onChange={(e) => setEditOpen((p: any) => ({ ...p, role: e.target.value }))}
              >
                <MenuItem value="EMPLOYEE">Employee</MenuItem>
                <MenuItem value="MANAGER">Manager</MenuItem>
              </TextField>
              <TextField
                select
                label="Positions"
                variant="outlined"
                value={(editOpen?.positions || []).map(String)}
                onChange={(e) => {
                  const val = (e.target as any).value as string[] | string;
                  const arr = Array.isArray(val)
                    ? val
                    : String(val || '')
                        .split(',')
                        .filter(Boolean);
                  setEditOpen((p: any) => ({ ...p, positions: arr.map(String) }));
                }}
                SelectProps={{
                  native: false,
                  multiple: true,
                  renderValue: (selected) =>
                    (selected as string[])
                      .map((id) => positions.find((p) => String(p._id) === String(id))?.name || id)
                      .join(', '),
                }}
              >
                {positions.map((p) => (
                  <MenuItem key={p._id} value={String(p._id)}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(null)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
              onClick={async () => {
                if (saving) return;
                if (!editOpen?._id) return;
                setSaving(true);
                const payload: any = {
                  firstName: editOpen.firstName || '',
                  lastName: editOpen.lastName || '',
                  role: editOpen.role || undefined,
                };
                if (editOpen?.status) {
                  const r = await fetch(`/api/invites/${editOpen._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
                  if (!r.ok) throw new Error('Failed to save invite');
                } else {
                  const r1 = await fetch(`/api/users/${editOpen._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });
                  if (!r1.ok) throw new Error('Failed to save user');
                  const r2 = await fetch(`/api/users/${editOpen._id}/positions`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ positionIds: (editOpen.positions || []).map(String) }),
                  });
                  if (!r2.ok) throw new Error('Failed to save positions');
                }
                setEditOpen(null);
                load();
                toast('Saved', 'success');
                setSaving(false);
              }}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={!!confirmResendId} onClose={() => setConfirmResendId(null)}>
          <DialogTitle>Resend invite?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Do you want to resend the invite
              {confirmResendEmail ? ` to ${confirmResendEmail}` : ''}?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmResendId(null)}>No</Button>
            <Button
              variant="contained"
              onClick={async () => {
                if (confirmResendId) await resendInvite(confirmResendId);
                setConfirmResendId(null);
                setConfirmResendEmail('');
              }}
            >
              Yes, resend
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </AppShell>
  );
}
