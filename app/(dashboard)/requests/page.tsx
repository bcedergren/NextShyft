'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Paper, Stack, Typography, Skeleton } from '@mui/material';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const INK = '#0F1B2D';
const MUTED = '#5B677A';
const BORDER = 'rgba(15, 27, 45, 0.10)';

export default function RequestsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [shifts, setShifts] = useState<Record<string, any>>({});
  const [users, setUsers] = useState<Record<string, any>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/swaps')
      .then((r) => r.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const schedules = await (await fetch('/api/schedules')).json();
        const sched = schedules?.[0];
        if (sched) {
          const s = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
          const map: Record<string, any> = {};
          for (const sh of s || []) map[sh._id] = sh;
          setShifts(map);
        }
        const u = await (await fetch('/api/users')).json();
        const umap: Record<string, any> = {};
        for (const x of u || []) umap[x._id] = x;
        setUsers(umap);
      } catch {
        setShifts({});
        setUsers({});
      }
    })();
  }, []);

  const decide = async (id: string, action: 'APPROVE' | 'DENY') => {
    const ok = window.confirm(`${action === 'APPROVE' ? 'Approve' : 'Deny'} this swap request?`);
    if (!ok) return;
    setBusyId(id);
    try {
      const res = await fetch('/api/swaps', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      if (res.ok) setItems((prev) => prev.filter((i) => i._id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RequestQuoteIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Requests
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Single inbox for time off, swaps, and availability
          </Typography>
        </Box>
      </Stack>
      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ color: '#475569', mb: 3 }}>
          Approve or deny swap requests with coverage impact preview.
        </Typography>
      {loading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
        </Stack>
      ) : items.length === 0 ? (
        <Typography color="text.secondary">No swap requests.</Typography>
      ) : (
        <Stack spacing={1.5}>
          {items.map((i) => {
            const sh = shifts[i.shiftId] || {};
            const rq = users[i.requesterId] || {};
            const date = sh.date ? new Date(sh.date).toDateString() : '';
            const window = sh.start && sh.end ? `${sh.start}–${sh.end}` : '';
            const displayName = [rq.firstName, rq.lastName].filter(Boolean).join(' ') || rq.name || rq.email || i.requesterId;
            return (
              <Paper
                key={i._id}
                sx={{
                  p: 2,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Typography fontWeight="600" fontSize="0.9375rem" sx={{ color: INK }}>
                  {displayName}: {i.type} — {date} {window}
                </Typography>
                <Typography fontSize="0.8125rem" sx={{ color: MUTED }}>
                  Shift {i.shiftId ? String(i.shiftId).slice(-6) : '—'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => decide(i._id, 'APPROVE')}
                    disabled={busyId === i._id}
                    sx={{
                      bgcolor: INK,
                      minHeight: 36,
                      fontWeight: 600,
                      '&:hover': { bgcolor: '#0a1320' },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => decide(i._id, 'DENY')}
                    disabled={busyId === i._id}
                    sx={{
                      borderColor: BORDER,
                      color: INK,
                      minHeight: 36,
                      fontWeight: 600,
                      '&:hover': { borderColor: 'rgba(15,27,45,0.25)', bgcolor: 'rgba(247,248,251,0.8)' },
                    }}
                  >
                    Deny
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
      </Paper>
    </Box>
  );
}
