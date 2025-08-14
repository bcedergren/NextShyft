'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import { Box, Paper, Stack, Typography, IconButton, Button } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';

type MyShift = { _id: string; date: string; start: string; end: string; positionName?: string };

export default function MySchedulePage() {
  const [items, setItems] = useState<MyShift[]>([]);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  // month is in format YYYY-MM

  const load = async () => {
    const list = await (await fetch('/api/my/shifts?month=' + month)).json();
    setItems(list);
  };
  useEffect(() => {
    load();
  }, [month]);

  const days = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0).getDate();
    const map: Record<number, MyShift[]> = {};
    for (let d = 1; d <= last; d++) map[d] = [];
    for (const s of items) {
      const dt = new Date(s.date);
      map[dt.getDate()].push(s);
    }
    return { first, last, map };
  }, [items, month]);

  const monthLabel = useMemo(() => dayjs(month + '-01').format('MMMM YYYY'), [month]);

  const requestSwap = async (shiftId: string) => {
    await fetch('/api/swaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId, type: 'offer', targetUserId: null }),
    });
    alert('Swap request submitted');
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">My Schedule</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton
            aria-label="Previous month"
            onClick={() =>
              setMonth(
                dayjs(month + '-01')
                  .subtract(1, 'month')
                  .format('YYYY-MM'),
              )
            }
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 180, textAlign: 'center' }}>
            {monthLabel}
          </Typography>
          <IconButton
            aria-label="Next month"
            onClick={() =>
              setMonth(
                dayjs(month + '-01')
                  .add(1, 'month')
                  .format('YYYY-MM'),
              )
            }
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Stack>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Box key={d} sx={{ fontWeight: 600, textAlign: 'center' }}>
                {d}
              </Box>
            ))}
            {Array.from({ length: days.first.getDay() }, (_, i) => (
              <Box key={'x' + i} />
            ))}
            {Array.from({ length: days.last }, (_, i) => {
              const day = i + 1;
              const list = days.map[day];
              return (
                <Box
                  key={day}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    minHeight: 80,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {day}
                  </Typography>
                  {list.map((s) => (
                    <Box
                      key={s._id}
                      sx={{ mt: 0.5, p: 0.5, bgcolor: 'action.selected', borderRadius: 0.5 }}
                    >
                      <Typography variant="body2">
                        {s.start}-{s.end} {s.positionName || ''}
                      </Typography>
                      <Button size="small" onClick={() => requestSwap(s._id)}>
                        Request swap
                      </Button>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        </Paper>
      </Stack>
    </AppShell>
  );
}
