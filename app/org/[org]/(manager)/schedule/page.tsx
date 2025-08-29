'use client';
import PlanGuard from '@/components/PlanGuard';
import AppShell from '@/components/AppShell';
import { PageHeader, PageLayout } from '@/components/page';
import {
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Checkbox, FormControlLabel } from '@mui/material';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function ManagerSchedulePage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.orgId || 'demo';
  const [publishing, setPublishing] = useState(false);
  const [positions, setPositions] = useState<Array<{ _id: string; name: string }>>([]);
  const [positionId, setPositionId] = useState<string>('');
  const [includeManagers, setIncludeManagers] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    status: string;
    publishedAt: string | null;
    hasUnpublishedChanges: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useSearchParams();
  useEffect(() => {
    // Accept legacy ?view param but calendar is the only view now.
  }, [params]);
  const [stats, setStats] = useState<{
    scheduleId: string | null;
    shiftCount: number;
    coveredCount: number;
    staffCount: number;
  }>({ scheduleId: null, shiftCount: 0, coveredCount: 0, staffCount: 0 });
  const toast = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const loadStatus = async () => {
    const d = await (await fetch('/api/schedules/status')).json();
    setStatus(d);
  };
  const loadPositions = async () => {
    try {
      const items = await (await fetch('/api/positions')).json();
      setPositions(Array.isArray(items) ? items : []);
    } catch {}
  };
  const loadStats = async () => {
    setLoading(true);
    try {
      const schedules = await (await fetch('/api/schedules')).json();
      const sched = schedules?.[0] || null;
      let shiftCount = 0;
      let coveredCount = 0;
      if (sched) {
        const shifts = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
        shiftCount = Array.isArray(shifts) ? shifts.length : 0;
        coveredCount = Array.isArray(shifts)
          ? shifts.filter((s: any) => (s.assignments?.length || 0) >= (s.requiredCount || 0)).length
          : 0;
      }
      const users = await (await fetch('/api/users')).json();
      const staffCount = Array.isArray(users) ? users.length : 0;
      setStats({ scheduleId: sched?._id || null, shiftCount, coveredCount, staffCount });
    } finally {
      setLoading(false);
    }
  };
  const publish = async () => {
    setPublishing(true);
    // get latest schedule id
    const schedules = await (await fetch('/api/schedules')).json();
    if (!schedules[0]) return setPublishing(false);
    const res = await fetch(`/api/schedules/${schedules[0]._id}/publish`, { method: 'POST' });
    setPublishing(false);
    loadStatus();
    if (res.ok) toast('Published', 'success');
  };
  const generate = async () => {
    const res = await fetch('/api/schedules/lp/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ includeManagers }),
    });
    loadStatus();
    if (res.ok) {
      try {
        const data = await res.json();
        const sum = data?.summary;
        if (sum) {
          const base = `Assigned ${sum.assignedPairs || 0} pairs • Covered ${sum.fullyCovered || 0}/${sum.totalShifts || 0} shifts${(sum.underfilled?.length || 0) > 0 ? ` • Underfilled: ${sum.underfilled.length}` : ''}`;
          const diag =
            (sum.assignedPairs || 0) === 0
              ? ` • candidates: ${sum.candidatePairs || 0} across ${sum.shiftsWithCandidates || 0} shifts`
              : '';
          const msg = base + diag;
          toast(msg, 'success');
          setRefreshKey((k) => k + 1);
        } else {
          toast('Auto-assign complete', 'success');
          setRefreshKey((k) => k + 1);
        }
      } catch {
        toast('Auto-assign complete', 'success');
        setRefreshKey((k) => k + 1);
      }
    } else {
      toast('Auto-assign failed', 'error');
    }
  };

  const createSchedule = async () => {
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart, periodEnd }),
    });
    if (res.ok) {
      toast('Schedule created', 'success');
      await loadStatus();
      await loadStats();
    } else {
      toast('Failed to create schedule', 'error');
    }
  };

  // initial
  useEffect(() => {
    loadStatus();
    loadStats();
    loadPositions();
  }, []);

  return (
    <AppShell>
      <PageLayout spacing={3} fullWidth disableGutters padding={0}>
        <PlanGuard />
        <PageHeader title="Schedule" />
        <Stack spacing={3}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ '@media print': { display: 'none' } }}
          >
            {/* Title removed to avoid duplication with PageHeader */}
            {/* View toggle removed: calendar only */}
            <Button variant="outlined" size="small" onClick={createSchedule}>
              Create schedule
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={generate}
              disabled={!stats.scheduleId || publishing}
            >
              Auto-assign
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={publish}
              disabled={!stats.scheduleId || publishing}
            >
              {publishing ? 'Publishing…' : 'Publish'}
            </Button>
            {status && (
              <Chip
                size="small"
                color={status.hasUnpublishedChanges ? 'warning' : 'success'}
                label={status.hasUnpublishedChanges ? 'Unpublished changes' : 'Up to date'}
              />
            )}
          </Stack>

          {/* Status and quick tip */}
          <Box>
            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
              {status?.publishedAt && (
                <Typography variant="caption" color="text.secondary">
                  Last published: {new Date(status.publishedAt).toLocaleString?.()}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Tip: Drag shifts to move them. Click a shift to edit/assign. Auto-assign proposes
                staffing; Publish when ready.
              </Typography>
            </Stack>
          </Box>

          <Box id="schedule-content">
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Paper sx={{ px: 0, py: 2 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems={{ xs: 'stretch', md: 'flex-start' }}
                  sx={{ gap: { xs: 1, md: '1px' } }}
                >
                  {/* Left sidebar with Position filter */}
                  <Box
                    sx={{
                      width: { xs: '100%', md: 260 },
                      flexShrink: 0,
                      position: 'sticky',
                      top: 16, // stay within the Paper padding
                      alignSelf: 'flex-start',
                      height: 'fit-content',
                      backgroundColor: 'background.paper',
                      zIndex: 1,
                    }}
                  >
                    <Stack spacing={1}>
                      <FormControl size="small" fullWidth>
                        <InputLabel id="pos-label" shrink>
                          Position
                        </InputLabel>
                        <Select
                          labelId="pos-label"
                          label="Position"
                          value={positionId}
                          onChange={(e) => setPositionId(String(e.target.value))}
                          displayEmpty
                          renderValue={(val) => {
                            const v = String(val ?? '');
                            if (!v) return <em>All positions</em>;
                            const match = positions.find((p) => p._id === v);
                            return match?.name || v;
                          }}
                        >
                          <MenuItem value="">
                            <em>All positions</em>
                          </MenuItem>
                          {positions.map((p) => (
                            <MenuItem key={p._id} value={p._id}>
                              {p.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={includeManagers}
                            onChange={(e) =>
                              setIncludeManagers((e.target as HTMLInputElement).checked)
                            }
                          />
                        }
                        label={<Typography variant="caption">Include managers</Typography>}
                        sx={{ ml: 0.5 }}
                      />
                    </Stack>
                    {/* Staff list container under the position dropdown */}
                    <Box id="staff-list-sidebar" sx={{ mt: 2 }} />
                  </Box>
                  {/* Calendar */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <ScheduleCalendar
                      key={`cal-${refreshKey}`}
                      positionId={positionId || undefined}
                      includeManagers={includeManagers}
                      staffListContainerId="staff-list-sidebar"
                    />
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Box>
        </Stack>
      </PageLayout>
    </AppShell>
  );
}
