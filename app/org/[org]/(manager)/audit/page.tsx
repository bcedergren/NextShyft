'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { Paper, Stack, TextField, Typography, MenuItem, Button, Skeleton } from '@mui/material';

export default function AuditPage() {
  const [items, setItems] = useState<any[]>([]);
  const [action, setAction] = useState<string>('');
  const [since, setSince] = useState<string>('');
  const [before, setBefore] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const load = async (append = false) => {
    setLoading(true);
    const q = new URLSearchParams();
    if (action) q.set('action', action);
    if (since) q.set('since', since);
    if (before) q.set('before', before);
    q.set('limit', '50');
    const r = await fetch('/api/audit' + (q.toString() ? '?' + q.toString() : ''));
    const d = await r.json();
    setItems((prev) => {
      const merged = append ? [...prev, ...d] : d;
      const seen = new Set<string>();
      return merged.filter((item: any) => {
        const id = item?._id ?? item?.id;
        if (!id) return true;
        if (seen.has(id)) return false;
        seen.add(id);
        return true;
      });
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Audit Log</Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr auto' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            select
            label="Action"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            fullWidth
          >
            {[
              '',
              'INVITE_CREATED',
              'INVITE_ACCEPTED',
              'SCHEDULE_PUBLISH',
              'SWAP_APPROVED',
              'SWAP_DENIED',
              'ROLE_CHANGE',
            ].map((a) => (
              <MenuItem key={a} value={a}>
                {a || 'Any'}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="date"
            label="Since"
            InputLabelProps={{ shrink: true }}
            value={since}
            onChange={(e) => setSince(e.target.value)}
            fullWidth
          />
          <TextField
            type="date"
            label="Before"
            InputLabelProps={{ shrink: true }}
            value={before}
            onChange={(e) => setBefore(e.target.value)}
            fullWidth
          />
          <Button
            variant="outlined"
            onClick={() => load(false)}
            sx={{ width: { xs: '100%', md: 'auto' } }}
          >
            Apply
          </Button>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack spacing={1}>
            {loading ? (
              <>
                <Skeleton variant="rectangular" height={28} />
                <Skeleton variant="rectangular" height={28} />
                <Skeleton variant="rectangular" height={28} />
                <Skeleton variant="rectangular" height={28} />
                <Skeleton variant="rectangular" height={28} />
              </>
            ) : (
              items.map((x: any) => (
                <div key={x._id}>
                  <Typography variant="subtitle2">
                    {new Date(x.createdAt).toLocaleString()} • {x.action}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                  >
                    {x.actorEmail} — {JSON.stringify(x.payload)}
                  </Typography>
                </div>
              ))
            )}
            {!loading && items.length === 0 && (
              <Typography color="text.secondary">No audit events.</Typography>
            )}
            {!loading && items.length > 0 && (
              <Stack direction="row" justifyContent="center" sx={{ mt: 1 }}>
                <Button
                  variant="text"
                  onClick={() => {
                    const last = items[items.length - 1];
                    setBefore(new Date(last.createdAt).toISOString());
                    load(true);
                  }}
                >
                  Load more
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      </Stack>
    </AppShell>
  );
}
