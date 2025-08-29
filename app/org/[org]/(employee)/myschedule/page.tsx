'use client';
import AppShell from '@/components/AppShell';
import { PageLayout } from '@/components/page';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  IconButton,
  Chip,
  TextField,
  MenuItem,
  Button,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PrintIcon from '@mui/icons-material/Print';
import dayjs from 'dayjs';

type Shift = {
  _id: string;
  date: string;
  start: string;
  end: string;
  positionId: string;
  requiredCount: number;
  assignments: { userId: string }[];
};

type Staff = { _id: string; name: string; email: string; firstName?: string; lastName?: string };
type Position = { _id: string; name: string };

export default function CompanySchedulePage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [positions, setPositions] = useState<Position[]>([]);
  const [positionId, setPositionId] = useState<string>('');

  const load = async () => {
    try {
      // Load schedules and get the current one
      let schedules = await (await fetch('/api/schedules')).json();
      let sched = schedules[0];

      // Ensure there is a schedule; if not, create a default 1-week period starting today
      if (!sched) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ periodStart: start.toISOString(), periodEnd: end.toISOString() }),
        });
        schedules = await (await fetch('/api/schedules')).json();
        sched = schedules[0];
      }

      if (!sched) return;

      // Load shifts for the current schedule
      const items = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
      setShifts(items || []);

      // Load staff information
      const users = await (await fetch('/api/users')).json();
      setStaff(users || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Load positions and default selection
  useEffect(() => {
    (async () => {
      try {
        const ps = await (await fetch('/api/positions')).json();
        if (Array.isArray(ps)) {
          setPositions(ps);
          // Default to all positions to preserve existing behavior
          setPositionId('');
        }
      } catch (e) {
        console.error('Error loading positions', e);
      }
    })();
  }, []);

  const days = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0).getDate();
    const map: Record<number, Shift[]> = {};
    for (let d = 1; d <= last; d++) map[d] = [];

    // Filter shifts for the selected month
    const monthShifts = shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return shiftDate.getFullYear() === y && shiftDate.getMonth() === m - 1;
    });
    const filtered = positionId
      ? monthShifts.filter((s) => s.positionId === positionId)
      : monthShifts;

    for (const s of filtered) {
      const dt = new Date(s.date);
      map[dt.getDate()].push(s);
    }
    return { first, last, map };
  }, [shifts, month, positionId]);

  const monthLabel = useMemo(() => dayjs(month + '-01').format('MMMM YYYY'), [month]);

  // Today helpers for highlighting current day (screen only)
  const today = useMemo(() => new Date(), []);
  const isCurrentMonth = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return today.getFullYear() === y && today.getMonth() === m - 1;
  }, [month, today]);

  const displayName = (user: Staff): string => {
    const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    return full || user.name || user.email || '';
  };

  const getCoverageStatus = (shift: Shift) => {
    if (shift.assignments.length < shift.requiredCount) return 'under';
    if (shift.assignments.length > shift.requiredCount) return 'over';
    return 'ok';
  };

  return (
    <AppShell>
      <PageLayout spacing={3}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3, '@media print': { display: 'none' } }}
        >
          <Typography
            variant="h5"
            fontWeight="400"
            sx={{ color: '#374151', fontSize: { xs: '1.25rem', md: '1.5rem' } }}
          >
            My Schedule
          </Typography>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <TextField
              select
              label="Position"
              size="small"
              value={positionId}
              onChange={(e) => setPositionId(e.target.value)}
              sx={{ minWidth: 220, flex: { xs: 1, sm: 'unset' } }}
            >
              <MenuItem value="">All positions</MenuItem>
              {positions.map((p) => (
                <MenuItem key={p._id} value={p._id}>
                  {p.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={() => {
                const prevTitle = document.title;
                // Clear the title so the browser's print header doesn't duplicate the logo text
                document.title = ' ';
                window.print();
                // Restore after a tick (afterprint event support varies by browser)
                setTimeout(() => {
                  document.title = prevTitle;
                }, 500);
              }}
            >
              Print
            </Button>
          </Stack>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '@media print': { display: 'none' },
          }}
        >
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
        </Box>

        {/* Print-only month header centered above calendar */}
        <Box
          sx={{
            display: 'none',
            '@media print': { display: 'block', textAlign: 'center', mb: 1.5 },
          }}
        >
          <Typography variant="h6" fontWeight={400} sx={{ color: '#374151' }}>
            {monthLabel}
          </Typography>
        </Box>

        <Paper sx={{ p: 2, '@media print': { boxShadow: 'none', border: 0, p: 0 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: 1,
              '@media print': { gap: 0.5 },
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Box key={d} sx={{ fontWeight: 600, textAlign: 'center', p: 1 }}>
                {d}
              </Box>
            ))}
            {Array.from({ length: days.first.getDay() }, (_, i) => (
              <Box key={'x' + i} />
            ))}
            {Array.from({ length: days.last }, (_, i) => {
              const day = i + 1;
              const dayShifts = days.map[day];
              const hasShifts = dayShifts.length > 0;
              const isToday = isCurrentMonth && day === today.getDate();

              return (
                <Box
                  key={day}
                  sx={{
                    border: '1px solid',
                    borderColor: isToday ? 'primary.main' : hasShifts ? 'primary.main' : 'divider',
                    borderRadius: 1,
                    p: 1,
                    minHeight: 100,
                    bgcolor: isToday
                      ? 'rgba(31,41,55,0.05)'
                      : hasShifts
                        ? 'primary.50'
                        : 'background.paper',
                    position: 'relative',
                    '@media print': {
                      minHeight: 80,
                      bgcolor: 'transparent',
                      borderColor: '#e5e7eb',
                      breakInside: 'avoid',
                    },
                  }}
                >
                  <Typography
                    variant="caption"
                    color={isToday ? 'primary.main' : hasShifts ? 'primary.main' : 'text.secondary'}
                    sx={{ fontWeight: isToday ? 700 : hasShifts ? 600 : 400 }}
                  >
                    {day}
                  </Typography>

                  {dayShifts.map((shift) => {
                    const coverage = getCoverageStatus(shift);
                    const coverageColor =
                      coverage === 'ok' ? 'success' : coverage === 'under' ? 'warning' : 'error';
                    const coverageLabel =
                      coverage === 'ok'
                        ? 'Covered'
                        : coverage === 'under'
                          ? `Under: ${shift.assignments.length}/${shift.requiredCount}`
                          : `Over: ${shift.assignments.length}/${shift.requiredCount}`;

                    return (
                      <Box
                        key={shift._id}
                        sx={{
                          mt: 0.5,
                          p: 0.5,
                          bgcolor: 'primary.main',
                          color: 'white',
                          borderRadius: 0.5,
                          '@media print': { bgcolor: '#111827', color: '#fff' },
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {shift.start}-{shift.end}
                        </Typography>

                        <Chip
                          label={coverageLabel}
                          color={coverageColor}
                          size="small"
                          sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                        />

                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          {shift.assignments.map((assignment) => {
                            const staffMember = staff.find(
                              (s) => s._id === assignment.userId || s.email === assignment.userId,
                            );
                            return (
                              <Typography
                                key={assignment.userId}
                                variant="caption"
                                sx={{
                                  opacity: 0.9,
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  px: 0.5,
                                  borderRadius: 0.25,
                                  display: 'block',
                                }}
                              >
                                {staffMember ? displayName(staffMember) : 'Unknown'}
                              </Typography>
                            );
                          })}
                        </Stack>
                      </Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        </Paper>
      </PageLayout>
    </AppShell>
  );
}
