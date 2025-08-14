'use client';
import AppShell from '@/components/AppShell';
import {
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Backdrop,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import CoverageEditor from '@/components/CoverageEditor';
import CoverageHeatmap from '@/components/CoverageHeatmap';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function CoveragePage() {
  const [mode, setMode] = useState<'month' | 'range'>('month');
  const [month, setMonth] = useState<Dayjs | null>(dayjs());
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [heat, setHeat] = useState<Record<string, { count: number }[]> | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [successOpen, setSuccessOpen] = useState<boolean>(false);
  const path = usePathname();
  const orgId = (() => {
    const m = (path || '').match(/^\/org\/([^/]+)/);
    return m?.[1] || 'demo';
  })();

  const generate = async () => {
    let periodStart: string;
    let periodEnd: string;
    if (mode === 'month') {
      if (!month) return;
      periodStart = month.startOf('month').format('YYYY-MM-DD');
      periodEnd = month.endOf('month').format('YYYY-MM-DD');
    } else {
      if (!start || !end) return;
      if (end.isBefore(start, 'day')) {
        alert('End date must be on or after Start date.');
        return;
      }
      periodStart = start.format('YYYY-MM-DD');
      periodEnd = end.format('YYYY-MM-DD');
    }
    setGenerating(true);
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periodStart, periodEnd }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(text || 'Failed to generate schedule');
      }
      // Auto-assign staff using LP solver
      try {
        await fetch('/api/schedules/lp/generate', { method: 'POST' });
      } catch {}
      setSuccessOpen(true);
    } catch (e: any) {
      alert(e?.message || 'Failed to generate schedule');
    } finally {
      setGenerating(false);
    }
  };

  const loadHeatmap = async () => {
    setLoading(true);
    // Aggregate demand across all positions into a single heatmap
    const positions = await (await fetch('/api/positions')).json();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grid = Object.fromEntries(
      dayNames.map((d) => [d, Array.from({ length: 24 }, () => ({ count: 0 }))]),
    );
    for (const p of positions) {
      const res = await fetch(`/api/demand?positionId=${p._id}`);
      if (!res.ok) continue;
      const { grid: g } = await res.json(); // g[7][24]
      const mapIdxToDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      for (let d = 0; d < 7; d++) {
        const day = mapIdxToDay[d];
        if (!grid[day]) continue;
        for (let h = 0; h < 24; h++) {
          grid[day][h].count += Number(g?.[d]?.[h] || 0);
        }
      }
    }
    setHeat(grid as any);
    setLoading(false);
  };

  useEffect(() => {
    loadHeatmap();
  }, []);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Coverage Planning</Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'auto 1fr 1fr auto' },
            gap: 2,
            alignItems: 'center',
          }}
        >
          <RadioGroup
            row
            value={mode}
            onChange={(e) => setMode((e.target as HTMLInputElement).value as 'month' | 'range')}
          >
            <FormControlLabel value="month" control={<Radio />} label="Whole month" />
            <FormControlLabel value="range" control={<Radio />} label="Start & End" />
          </RadioGroup>
          {mode === 'month' ? (
            <>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Month"
                  views={['year', 'month']}
                  value={month}
                  onChange={(v) => setMonth(v)}
                  slotProps={{ textField: { fullWidth: true, disabled: generating } }}
                />
              </LocalizationProvider>
              <Box />
            </>
          ) : (
            <>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start"
                  value={start}
                  onChange={(v) => setStart(v)}
                  slotProps={{ textField: { fullWidth: true, disabled: generating } }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End"
                  value={end}
                  onChange={(v) => setEnd(v)}
                  slotProps={{ textField: { fullWidth: true, disabled: generating } }}
                />
              </LocalizationProvider>
            </>
          )}
          <Button
            variant="contained"
            onClick={generate}
            disabled={generating || (mode === 'month' ? !month : !start || !end)}
          >
            {generating ? 'Generating…' : 'Generate Schedule'}
          </Button>
          {generating && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', ml: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </Paper>
        <Paper sx={{ p: 2, overflowX: { xs: 'auto', md: 'visible' } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <CoverageEditor />
          )}
        </Paper>
        <Paper sx={{ p: 2, overflowX: { xs: 'auto', md: 'visible' } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              Aggregated Coverage
            </Typography>
            <Button size="small" variant="outlined" onClick={loadHeatmap}>
              Refresh Heatmap
            </Button>
          </Stack>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : (
            <CoverageHeatmap data={heat} />
          )}
        </Paper>
      </Stack>
      <Backdrop open={generating} sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress color="inherit" />
          <Typography>Generating schedule…</Typography>
        </Stack>
      </Backdrop>
      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)}>
        <DialogTitle>Schedule ready</DialogTitle>
        <DialogContent>Your schedule has been created from the coverage templates.</DialogContent>
        <DialogActions>
          <Button onClick={() => setSuccessOpen(false)}>Close</Button>
          <Button variant="contained" href={`/org/${orgId}/schedule?view=calendar`}>
            View schedule
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}
