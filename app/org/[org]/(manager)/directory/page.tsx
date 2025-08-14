'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  Skeleton,
} from '@mui/material';

export default function DirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [role, setRole] = useState<string>('ALL');
  const [pos, setPos] = useState<string>('ALL');
  const [query, setQuery] = useState<string>('');
  const [q, setQ] = useState<string>('');
  const exportCsv = () => {
    const header = ['name', 'email', 'roles'];
    const rows = filtered.map((u) => [u.name || '', u.email || '', (u.roles || []).join('|')]);
    const csv = [
      header.join(','),
      ...rows.map((r) => r.map((x) => String(x).replace(/"/g, '""')).join(',')),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'directory.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [u, p] = await Promise.all([
          fetch('/api/users').then((r) => r.json()),
          fetch('/api/positions').then((r) => r.json()),
        ]);
        setUsers(u);
        setPositions(p);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (role !== 'ALL' && !(u.roles || []).includes(role)) return false;
      if (pos !== 'ALL' && !(u.positions || []).map(String).includes(pos)) return false;
      if (
        query &&
        !((u.name || '') + ' ' + (u.email || '')).toLowerCase().includes(query.toLowerCase())
      )
        return false;
      return true;
    });
  }, [users, role, pos, query]);

  // Debounce q -> query
  useEffect(() => {
    const t = setTimeout(() => setQuery(q), 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">People Directory</Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 2fr auto' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
            {['ALL', 'EMPLOYEE', 'MANAGER', 'OWNER', 'SUPER_ADMIN'].map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Position" value={pos} onChange={(e) => setPos(e.target.value)}>
            <MenuItem value="ALL">ALL</MenuItem>
            {positions.map((p: any) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Name or email"
          />
          <Button variant="outlined" onClick={exportCsv}>
            Export
          </Button>
        </Paper>
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
            </Stack>
          ) : (
            filtered.map((u) => (
              <Stack
                key={u._id}
                direction={{ xs: 'column', md: 'row' }}
                spacing={1}
                sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Typography sx={{ width: 280 }}>{u.name || u.email}</Typography>
                <Typography sx={{ width: 320 }} color="text.secondary">
                  {u.email}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {(u.roles || []).map((r: string) => (
                    <Chip key={r} label={r} size="small" />
                  ))}
                </Box>
              </Stack>
            ))
          )}
          {!loading && filtered.length === 0 && (
            <Typography color="text.secondary">No matches.</Typography>
          )}
        </Paper>
      </Stack>
    </AppShell>
  );
}
