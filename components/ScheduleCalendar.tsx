'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
} from '@mui/material';

type Shift = {
  _id: string;
  date: string;
  start: string;
  end: string;
  positionId: string;
  requiredCount: number;
  assignments: { userId: string }[];
};

export default function ScheduleCalendar() {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day; // Sunday start
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<{ _id: string; name?: string; email: string }[]>([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [assignSel, setAssignSel] = useState<Record<string, boolean>>({});
  const [timeForm, setTimeForm] = useState<{ start: string; end: string }>({ start: '', end: '' });

  const load = async () => {
    let schedules = await (await fetch('/api/schedules')).json();
    const sched = schedules?.[0];
    if (!sched) return setShifts([]);
    const items = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
    setShifts(items || []);
    const users = await (await fetch('/api/users')).json();
    setStaff(users || []);
  };

  useEffect(() => {
    load();
  }, []);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    });
  }, [weekStart]);

  const shiftsByDay = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    const days =
      mode === 'week'
        ? weekDays
        : (() => {
            const list: Date[] = [];
            const y = monthStart.getFullYear();
            const m = monthStart.getMonth();
            const count = new Date(y, m + 1, 0).getDate();
            for (let i = 1; i <= count; i++) {
              const d = new Date(y, m, i);
              d.setHours(0, 0, 0, 0);
              list.push(d);
            }
            return list;
          })();
    for (const day of days) {
      map[day.toDateString()] = [];
    }
    for (const s of shifts) {
      const key = new Date(s.date).toDateString();
      if (map[key]) map[key].push(s);
    }
    // sort by start time
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0)),
    );
    return map;
  }, [shifts, weekDays, mode, monthStart]);

  return (
    <Stack spacing={2}>
      <Box sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Staff — drag onto a shift to assign
        </Typography>
        <Stack direction="row" spacing={1} sx={{ overflowX: 'auto' }}>
          {staff.map((u) => (
            <Chip
              key={u._id}
              label={u.name || u.email}
              draggable
              onDragStart={(e) => {
                try {
                  e.dataTransfer.setData('staffId', u._id);
                  e.dataTransfer.setData('text/plain', JSON.stringify({ staffId: u._id }));
                } catch {}
              }}
            />
          ))}
        </Stack>
      </Box>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Typography variant="h6" sx={{ flex: 1 }}>
          {mode === 'week'
            ? `Week of ${weekStart.toLocaleDateString?.()}`
            : monthStart.toLocaleDateString?.(undefined, { month: 'long', year: 'numeric' })}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant={mode === 'week' ? 'contained' : 'outlined'}
            onClick={() => setMode('week')}
          >
            Week
          </Button>
          <Button
            variant={mode === 'month' ? 'contained' : 'outlined'}
            onClick={() => setMode('month')}
          >
            Month
          </Button>
        </Stack>
        {mode === 'week' ? (
          <>
            <Button onClick={() => setWeekStart((d) => new Date(d.getTime() - 7 * 86400000))}>
              Prev
            </Button>
            <Button onClick={() => setWeekStart(new Date())}>Today</Button>
            <Button onClick={() => setWeekStart((d) => new Date(d.getTime() + 7 * 86400000))}>
              Next
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => setMonthStart((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            >
              Prev
            </Button>
            <Button
              onClick={() =>
                setMonthStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1))
              }
            >
              This Month
            </Button>
            <Button
              onClick={() => setMonthStart((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            >
              Next
            </Button>
          </>
        )}
      </Stack>

      {mode === 'week' ? (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
          {weekDays.map((day) => (
            <Box
              key={day.toDateString()}
              sx={{ border: '1px solid', borderColor: 'divider', p: 1 }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {day.toLocaleDateString?.(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Stack spacing={1}>
                {(shiftsByDay[day.toDateString()] || []).map((s) => (
                  <Box
                    key={s._id}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      const idA = e.dataTransfer.getData('staffId');
                      let idB = '';
                      try {
                        const parsed = JSON.parse(e.dataTransfer.getData('text/plain') || '{}');
                        idB = parsed.staffId || '';
                      } catch {}
                      const staffId = idA || idB;
                      if (staffId) {
                        await fetch('/api/shifts/assign', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ shiftId: s._id, staffId }),
                        });
                        await load();
                      }
                    }}
                    onClick={() => {
                      setActiveShift(s);
                      setAssignSel(
                        (s.assignments || []).reduce(
                          (acc, a) => {
                            acc[a.userId] = true;
                            return acc;
                          },
                          {} as Record<string, boolean>,
                        ),
                      );
                      setTimeForm({ start: s.start, end: s.end });
                      setAssignOpen(true);
                    }}
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      bgcolor: 'background.default',
                      border: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                    }}
                  >
                    <Typography variant="body2">
                      {s.start}–{s.end}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${s.assignments.length}/${s.requiredCount}`}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>
      ) : (
        (() => {
          const y = monthStart.getFullYear();
          const m = monthStart.getMonth();
          const firstDow = new Date(y, m, 1).getDay(); // 0=Sun
          const daysInMonth = new Date(y, m + 1, 0).getDate();
          const cells: Array<{ date: Date | null }> = [];
          for (let i = 0; i < firstDow; i++) cells.push({ date: null });
          for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(y, m, d) });
          // pad to full weeks
          while (cells.length % 7 !== 0) cells.push({ date: null });
          return (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {cells.map((c, idx) => (
                <Box
                  key={idx}
                  sx={{ border: '1px solid', borderColor: 'divider', p: 1, minHeight: 100 }}
                >
                  {c.date && (
                    <>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {c.date.toLocaleDateString?.(undefined, { day: 'numeric' })}
                      </Typography>
                      <Divider sx={{ mb: 1 }} />
                      <Stack spacing={1}>
                        {(shiftsByDay[c.date.toDateString()] || []).map((s) => (
                          <Box
                            key={s._id}
                            onClick={() => {
                              setActiveShift(s);
                              setAssignSel(
                                (s.assignments || []).reduce(
                                  (acc, a) => {
                                    acc[a.userId] = true;
                                    return acc;
                                  },
                                  {} as Record<string, boolean>,
                                ),
                              );
                              setTimeForm({ start: s.start, end: s.end });
                              setAssignOpen(true);
                            }}
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'background.default',
                              border: '1px solid',
                              borderColor: 'divider',
                              cursor: 'pointer',
                            }}
                          >
                            <Typography variant="body2">
                              {s.start}–{s.end}
                            </Typography>
                            <Chip
                              size="small"
                              label={`${s.assignments.length}/${s.requiredCount}`}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    </>
                  )}
                </Box>
              ))}
            </Box>
          );
        })()
      )}

      {/* Assign staff dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Shift</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {activeShift ? new Date(activeShift.date).toDateString() : ''}
          </Typography>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                label="Start"
                type="time"
                value={timeForm.start}
                onChange={(e) => setTimeForm((p) => ({ ...p, start: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                label="End"
                type="time"
                value={timeForm.end}
                onChange={(e) => setTimeForm((p) => ({ ...p, end: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <Button
                onClick={async () => {
                  if (!activeShift) return;
                  const r = await fetch(`/api/shifts/${activeShift._id}/time`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ start: timeForm.start, end: timeForm.end }),
                  });
                  if (r.ok) await load();
                }}
              >
                Save Time
              </Button>
            </Stack>

            <Divider />
            <Typography variant="subtitle2">Assignments</Typography>
            <Stack spacing={0.5} sx={{ maxHeight: 260, overflow: 'auto' }}>
              {staff.map((u) => (
                <FormControlLabel
                  key={u._id}
                  control={
                    <Checkbox
                      checked={!!assignSel[u._id]}
                      onChange={(e) =>
                        setAssignSel((s) => ({
                          ...s,
                          [u._id]: (e.target as HTMLInputElement).checked,
                        }))
                      }
                    />
                  }
                  label={u.name || u.email}
                />
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!activeShift) return;
              const selected = Object.keys(assignSel).filter((id) => assignSel[id]);
              await fetch('/api/shifts/assign', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shiftId: activeShift._id, staffIds: selected }),
              });
              await load();
              setAssignOpen(false);
            }}
          >
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
