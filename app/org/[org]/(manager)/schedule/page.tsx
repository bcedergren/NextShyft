'use client';
import PlanGuard from '@/components/PlanGuard';
import AppShell from '@/components/AppShell';
import {
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Box,
  CircularProgress,
} from '@mui/material';
import ScheduleBoard from '@/components/ScheduleBoard';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

export default function ManagerSchedulePage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.orgId || 'demo';
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{
    status: string;
    publishedAt: string | null;
    hasUnpublishedChanges: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const params = useSearchParams();
  useEffect(() => {
    const v = (params.get('view') || '').toLowerCase();
    if (v === 'calendar') setView('calendar');
  }, [params]);
  const [stats, setStats] = useState<{
    scheduleId: string | null;
    shiftCount: number;
    coveredCount: number;
    staffCount: number;
  }>({ scheduleId: null, shiftCount: 0, coveredCount: 0, staffCount: 0 });
  const toast = useToast();
  const loadStatus = async () => {
    const d = await (await fetch('/api/schedules/status')).json();
    setStatus(d);
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
    const res = await fetch('/api/schedules/lp/generate', { method: 'POST' });
    loadStatus();
    if (res.ok) toast('Solver run complete (or queued)', 'success');
  };

  // initial
  useEffect(() => {
    loadStatus();
    loadStats();
  }, []);

  return (
    <AppShell>
      <Stack spacing={2}>
        <PlanGuard />
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h5" sx={{ flex: 1 }}>
            Schedule
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              variant={view === 'list' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setView('list')}
            >
              List
            </Button>
            <Button
              variant={view === 'calendar' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setView('calendar')}
            >
              Calendar
            </Button>
          </Stack>
          {status && (
            <Chip
              size="small"
              color={status.hasUnpublishedChanges ? 'warning' : 'success'}
              label={status.hasUnpublishedChanges ? 'Unpublished changes' : 'Up to date'}
            />
          )}
          {status?.publishedAt && (
            <Typography variant="body2" color="text.secondary">
              Last published: {new Date(status.publishedAt).toLocaleString?.()}
            </Typography>
          )}
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
        </Stack>

        <Paper sx={{ p: 2 }}>
          {(() => {
            const activeStep = (() => {
              if (!stats.shiftCount) return 0;
              if (stats.coveredCount < stats.shiftCount) return 1;
              if (status?.hasUnpublishedChanges) return 2;
              return 3;
            })();
            return (
              <Stepper alternativeLabel nonLinear activeStep={activeStep}>
                <Step completed={false}>
                  <StepLabel>Prepare</StepLabel>
                </Step>
                <Step completed={false}>
                  <StepLabel>Assign</StepLabel>
                </Step>
                <Step completed={false}>
                  <StepLabel>Review</StepLabel>
                </Step>
                <Step completed={false}>
                  <StepLabel>Publish</StepLabel>
                </Step>
              </Stepper>
            );
          })()}
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Tip: Drag shifts to move them. Click a shift to edit time or assign staff. Use
            Auto-assign to propose staffing, then Publish when ready.
          </Typography>
        </Paper>

        <Box id="schedule-content">
          <Stack spacing={2} sx={{ height: '100%' }}>
            <Paper sx={{ p: 2 }}>
              {view === 'list' ? <ScheduleBoard /> : <ScheduleCalendar />}
            </Paper>
          </Stack>
        </Box>
      </Stack>
    </AppShell>
  );
}
