'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { Button, Paper, Stack, Typography, Skeleton } from '@mui/material';
import { useMemo } from 'react';

export default function SwapQueue() {
  const [items, setItems] = useState<any[]>([]);
  const [shifts, setShifts] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<Record<string, any>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/swaps')
      .then((r) => r.json())
      .then((d) => setItems(d))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    (async () => {
      // fetch latest schedule shifts and users once to enrich rows
      const schedules = await (await fetch('/api/schedules')).json();
      const sched = schedules[0];
      if (sched) {
        const s = await (await fetch('/api/shifts?scheduleId=' + sched._id)).json();
        const map: Record<string, any> = {};
        for (const sh of s) map[sh._id] = sh;
        setShifts(map);
      }
      const u = await (await fetch('/api/users')).json();
      const umap: Record<string, any> = {};
      for (const x of u) umap[x._id] = x;
      setUsers(umap);
    })();
  }, []);

  const decide = async (id: string, action: 'APPROVE' | 'DENY') => {
    const ok = window.confirm(`${action === 'APPROVE' ? 'Approve' : 'Deny'} this swap request?`);
    if (!ok) return;
    setBusyId(id);
    try {
      await fetch('/api/swaps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      setItems((prev) => prev.filter((i) => i._id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Swap Requests</Typography>
        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
            <Skeleton variant="rectangular" height={56} />
          </Stack>
        ) : items.length === 0 ? (
          <Typography color="text.secondary">No swap requests.</Typography>
        ) : (
          items.map((i) => {
            const sh = shifts[i.shiftId] || {};
            const rq = users[i.requesterId] || {};
            const date = sh.date ? new Date(sh.date).toDateString() : '';
            const window = sh.start && sh.end ? `${sh.start}-${sh.end}` : '';
            return (
              <Paper key={i._id} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography flex={1}>
                  {date} {window} • Shift {i.shiftId} • {rq.name || rq.email || i.requesterId} •{' '}
                  {i.type}
                </Typography>
                <Button
                  onClick={() => decide(i._id, 'APPROVE')}
                  variant="contained"
                  disabled={busyId === i._id}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => decide(i._id, 'DENY')}
                  variant="outlined"
                  disabled={busyId === i._id}
                >
                  Deny
                </Button>
              </Paper>
            );
          })
        )}
      </Stack>
    </AppShell>
  );
}
