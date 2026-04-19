'use client';

import {
  Typography,
  Button,
  Stack,
  Paper,
  Chip,
  Box,
  CircularProgress,
} from '@mui/material';
import ScheduleBoard from '@/components/ScheduleBoard';
import ScheduleCalendar from '@/components/ScheduleCalendar';
import PageHeader from '@/components/PageHeader';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { useSearchParams } from 'next/navigation';

export default function ScheduleBuilderPage() {
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState<{
    status: string;
    publishedAt: string | null;
    hasUnpublishedChanges: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const params = useSearchParams();
  const viewParam = params.get('view');
  useEffect(() => {
    const v = (viewParam || '').toLowerCase();
    if (v === 'calendar') setView('calendar');
  }, [viewParam]);
  const [stats, setStats] = useState<{
    scheduleId: string | null;
    shiftCount: number;
    coveredCount: number;
    staffCount: number;
  }>({ scheduleId: null, shiftCount: 0, coveredCount: 0, staffCount: 0 });
  const toast = useToast();

  const loadStatus = async () => {
    try {
      const d = await (await fetch('/api/schedules/status')).json();
      setStatus(d);
    } catch {
      setStatus(null);
    }
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
    } catch {
      setStats({ scheduleId: null, shiftCount: 0, coveredCount: 0, staffCount: 0 });
    } finally {
      setLoading(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    try {
      const schedules = await (await fetch('/api/schedules')).json();
      if (!schedules?.[0]) return;
      const res = await fetch(`/api/schedules/${schedules[0]._id}/publish`, { method: 'POST' });
      loadStatus();
      if (res.ok) toast('Published', 'success');
    } finally {
      setPublishing(false);
    }
  };

  const generate = async () => {
    const res = await fetch('/api/schedules/lp/generate', { method: 'POST' });
    loadStatus();
    if (res.ok) toast('Solver run complete (or queued)', 'success');
  };

  useEffect(() => {
    loadStatus();
    loadStats();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        titleStart={<CalendarMonthIcon />}
        title="Schedule"
        subtitle="Build and publish shifts. Use Auto-assign to propose staffing, then Publish when ready."
      />
      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Stack direction="row" spacing={1}>
              <Button variant={view === 'list' ? 'contained' : 'outlined'} size="small" onClick={() => setView('list')}>
                List
              </Button>
              <Button variant={view === 'calendar' ? 'contained' : 'outlined'} size="small" onClick={() => setView('calendar')}>
                Calendar
              </Button>
            </Stack>
            {status && (
              <Chip size="small" color={status.hasUnpublishedChanges ? 'warning' : 'success'} label={status.hasUnpublishedChanges ? 'Unpublished changes' : 'Up to date'} />
            )}
            {status?.publishedAt && (
              <Typography variant="body2" color="text.secondary">
                Last published: {new Date(status.publishedAt).toLocaleString?.()}
              </Typography>
            )}
            <Button variant="outlined" size="small" onClick={generate} disabled={!stats.scheduleId || publishing}>
              Auto-assign
            </Button>
            <Button variant="contained" size="small" onClick={publish} disabled={!stats.scheduleId || publishing}>
              {publishing ? 'Publishing…' : 'Publish'}
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Tip: Drag shifts to move them. Click a shift to edit time or assign staff.
          </Typography>
          <Box id="schedule-content">
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              view === 'list' ? <ScheduleBoard /> : <ScheduleCalendar />
            )}
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
