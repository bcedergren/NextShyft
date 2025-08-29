'use client';

import AppShell from '@/components/AppShell';
import {
  Stack,
  Paper,
  Typography,
  Button,
  Skeleton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
} from '@mui/material';
import CoverageHeatmap from '@/components/CoverageHeatmap';
import { useEffect, useMemo, useState } from 'react';

export default function ReportsPage() {
  const [heat, setHeat] = useState<Record<string, { count: number }[]> | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingStats, setLoadingStats] = useState<boolean>(true);
  const [stats, setStats] = useState<{
    scheduleId: string | null;
    shiftCount: number;
    coveredCount: number;
    staffCount: number;
    openSwaps: number;
    hoursByUser: Record<string, number>;
    usersById: Record<string, { _id: string; name?: string; email?: string }>;
  }>({
    scheduleId: null,
    shiftCount: 0,
    coveredCount: 0,
    staffCount: 0,
    openSwaps: 0,
    hoursByUser: {},
    usersById: {},
  });

  const loadHeatmap = async () => {
    setLoading(true);
    const positions = await (await fetch('/api/positions')).json();
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const grid = Object.fromEntries(
      dayNames.map((d) => [d, Array.from({ length: 24 }, () => ({ count: 0 }))]),
    );
    for (const p of positions) {
      const res = await fetch(`/api/demand?positionId=${p._id}`);
      if (!res.ok) continue;
      const { grid: g } = await res.json();
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
    loadStats();
  }, []);

  const hoursBetween = (start: string, end: string): number => {
    const [sH, sM] = start.split(':').map((x) => parseInt(x, 10));
    const [eH, eM] = end.split(':').map((x) => parseInt(x, 10));
    let mins = eH * 60 + eM - (sH * 60 + sM);
    if (mins < 0) mins += 24 * 60; // handle overnight just in case
    return Math.round((mins / 60) * 100) / 100;
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const schedules = await (await fetch('/api/schedules')).json();
      const sched = schedules?.[0] || null;
      let shiftCount = 0;
      let coveredCount = 0;
      const hoursByUser: Record<string, number> = {};
      if (sched) {
        const shifts = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
        if (Array.isArray(shifts)) {
          shiftCount = shifts.length;
          for (const s of shifts) {
            const assigned = s.assignments?.length || 0;
            if (assigned >= (s.requiredCount || 0)) coveredCount += 1;
            const h = hoursBetween(s.start, s.end);
            for (const a of s.assignments || []) {
              const uid = a.userId;
              hoursByUser[uid] = (hoursByUser[uid] || 0) + h;
            }
          }
        }
      }
      const users = await (await fetch('/api/users')).json();
      const staffCount = Array.isArray(users) ? users.length : 0;
      const usersById: Record<string, any> = {};
      if (Array.isArray(users)) {
        for (const u of users) usersById[String(u._id)] = u;
      }
      const swaps = await (await fetch('/api/swaps')).json();
      let openSwaps = 0;
      if (Array.isArray(swaps)) {
        openSwaps = swaps.filter(
          (s: any) => !['MANAGER_APPROVED', 'DENIED'].includes(String(s.status || 'PENDING')),
        ).length;
      }
      setStats({
        scheduleId: sched?._id || null,
        shiftCount,
        coveredCount,
        staffCount,
        openSwaps,
        hoursByUser,
        usersById,
      });
    } catch (e) {
      // best effort; leave defaults
    } finally {
      setLoadingStats(false);
    }
  };

  const coveragePct = useMemo(() => {
    if (!stats.shiftCount) return 0;
    return Math.round((stats.coveredCount / stats.shiftCount) * 100);
  }, [stats.shiftCount, stats.coveredCount]);

  const topHours = useMemo(() => {
    const rows = Object.entries(stats.hoursByUser).map(([uid, hours]) => ({ uid, hours }));
    rows.sort((a, b) => b.hours - a.hours);
    return rows.slice(0, 10);
  }, [stats.hoursByUser]);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Reports</Typography>
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button size="small" variant="outlined" onClick={loadStats} disabled={loadingStats}>
              {loadingStats ? 'Refreshing…' : 'Refresh Stats'}
            </Button>
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 1, flexWrap: 'wrap' }}>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{coveragePct}%</Typography>
                <Typography variant="caption">Coverage rate</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">
                  {Math.max(0, stats.shiftCount - stats.coveredCount)}
                </Typography>
                <Typography variant="caption">Unfilled shifts</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{stats.staffCount}</Typography>
                <Typography variant="caption">Active staff</Typography>
              </Paper>
            </Box>
            <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{stats.openSwaps}</Typography>
                <Typography variant="caption">Open swap requests</Typography>
              </Paper>
            </Box>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, overflowX: { xs: 'auto', md: 'visible' } }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" sx={{ flex: 1 }}>
              Coverage Heatmap
            </Typography>
            <Button size="small" variant="outlined" onClick={loadHeatmap}>
              Refresh
            </Button>
            <Button size="small" variant="outlined" href="/api/audit/export">
              Export Audit CSV
            </Button>
          </Stack>
          {loading ? (
            <Skeleton variant="rectangular" height={320} />
          ) : (
            <CoverageHeatmap data={heat} />
          )}
        </Paper>
        <Paper sx={{ p: 2, overflowX: 'auto' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Hours by employee (current schedule)
          </Typography>
          {loadingStats ? (
            <Skeleton variant="rectangular" height={160} />
          ) : topHours.length === 0 ? (
            <Typography variant="body2">No assigned hours yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell align="right">Hours</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {topHours.map((r) => {
                  const u = stats.usersById[r.uid] as
                    | { _id: string; name?: string; email?: string }
                    | undefined;
                  const name = u?.name || u?.email || r.uid;
                  return (
                    <TableRow key={r.uid}>
                      <TableCell>{name}</TableCell>
                      <TableCell align="right">{r.hours.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Stack>
    </AppShell>
  );
}
