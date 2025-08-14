'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
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
type Staff = { _id: string; name: string; email: string; positions?: string[] };
type Availability = Record<string, { start: string; end: string }[]>;

const DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function within(a: string, b: string, start: string, end: string) {
  return a <= start && b >= end;
}
function overlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart < bEnd && bStart < aEnd;
}
function hoursBetween(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh + em / 60 - (sh + sm / 60);
}
function shortId(id: string) {
  try {
    return id?.length > 8 ? id.slice(0, 6) + '…' : id;
  } catch {
    return id;
  }
}
function displayName(u: any): string {
  const full = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
  return full || u.name || u.email || '';
}

export default function ScheduleBoard() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [availability, setAvailability] = useState<Record<string, Availability>>({});
  const [picker, setPicker] = useState<{
    open: boolean;
    shift?: Shift;
    replacing?: string | null;
    q: string;
  }>({ open: false, replacing: null, q: '' });
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: '' });
  const [timeEdit, setTimeEdit] = useState<{
    open: boolean;
    id?: string;
    start: string;
    end: string;
  }>({ open: false, start: '', end: '' });
  const undoStack = useRef<{ shiftId: string; prev: string[] }[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const draggingSelect = useRef<boolean>(false);
  // Planning UI removed from schedule page; templates are managed on Shifts page

  const load = async () => {
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
    const items = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
    setShifts(items);
    const users = await (await fetch('/api/users')).json();
    setStaff(users);
    const all = await (await fetch('/api/availability/all')).json();
    setAvailability(all);
  };

  useEffect(() => {
    load();
  }, []);

  // Planning actions handled on Shifts page; keep only import/generate

  const generateFromPlan = async () => {
    // Ensure there's a schedule before attempting to import/solve
    try {
      let schedules = await (await fetch('/api/schedules')).json();
      if (!schedules?.[0]) {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        await fetch('/api/schedules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ periodStart: start.toISOString(), periodEnd: end.toISOString() }),
        });
      }
    } catch {}
    const res = await fetch('/api/schedules/lp/generate', { method: 'POST' });
    if (res.ok) {
      await load();
      setToast({ open: true, msg: 'Generated shifts from plan' });
    }
  };

  const coverage = useMemo(() => {
    const m: Record<string, 'ok' | 'under' | 'over'> = {};
    for (const s of shifts) {
      if (s.assignments.length < s.requiredCount) m[s._id] = 'under';
      else if (s.assignments.length > s.requiredCount) m[s._id] = 'over';
      else m[s._id] = 'ok';
    }
    return m;
  }, [shifts]);

  // conflicts: availability + double-booking overlaps
  const conflicts = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const sh of shifts) {
      map[sh._id] = [];
      const dow = DOW[new Date(sh.date).getDay()];
      for (const a of sh.assignments) {
        const u = staff.find((s) => s._id === a.userId || s.email === a.userId);
        if (!u) continue;
        const weekly = availability[u.email || ''] || {};
        const okAvail = (weekly[dow] || []).some((r) => within(r.start, r.end, sh.start, sh.end));
        if (!okAvail) map[sh._id].push(`Availability conflict for ${u.name || a.userId}`);
        // double booking: other shifts same day overlapping for same user
        for (const other of shifts) {
          if (
            other._id === sh._id ||
            new Date(other.date).toDateString() !== new Date(sh.date).toDateString()
          )
            continue;
          const userOnOther = other.assignments.some((x) => x.userId === a.userId);
          if (userOnOther && overlap(sh.start, sh.end, other.start, other.end)) {
            map[sh._id].push(`Double-booked with another shift for ${u.name || a.userId}`);
            break;
          }
        }
      }
    }
    return map;
  }, [shifts, staff, availability]);

  // hour totals & overtime
  const hoursByUser = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of shifts) {
      const h = hoursBetween(s.start, s.end);
      for (const a of s.assignments) map[a.userId] = (map[a.userId] || 0) + h;
    }
    return map;
  }, [shifts]);

  const saveAssign = async (shiftId: string, ids: string[]) => {
    undoStack.current.push({
      shiftId,
      prev: (shifts.find((s) => s._id === shiftId)?.assignments || []).map((a) => a.userId),
    });
    await fetch('/api/shifts/assign', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId, staffIds: ids }),
    });
    await load();
    setToast({ open: true, msg: 'Saved. Undo available.' });
  };

  const onDrop = async (shiftId: string, staffId: string) => {
    const sh = shifts.find((s) => s._id === shiftId);
    if (!sh) return;
    const ids = Array.from(new Set([...sh.assignments.map((a) => a.userId), staffId]));
    await saveAssign(shiftId, ids);
  };

  const openPicker = (s: Shift, replacing: string | null = null) =>
    setPicker({ open: true, shift: s, replacing, q: '' });
  const closePicker = () => setPicker({ open: false, replacing: null, q: '' });

  const eligible = useMemo(() => {
    const s = picker.shift;
    if (!s) return [];
    const dow = DOW[new Date(s.date).getDay()];
    return staff
      .filter((u) => {
        const hasPos = (u.positions || []).map(String).includes(String(s.positionId));
        const weekly = availability[u.email] || {};
        const ok = (weekly[dow] || []).some((r) => within(r.start, r.end, s.start, s.end));
        const already = s.assignments.some((a) => a.userId === u._id || a.userId === u.email);
        return hasPos && ok && !already;
      })
      .filter((u) => (u.name || u.email).toLowerCase().includes((picker.q || '').toLowerCase()));
  }, [picker.shift, picker.q, staff, availability]);

  const addFromPicker = async (uid: string) => {
    if (!picker.shift) return;
    const sh = picker.shift;
    let ids = sh.assignments.map((a) => a.userId);
    if (picker.replacing) {
      ids = ids.filter((x) => x !== picker.replacing);
    }
    ids = Array.from(new Set([...ids, uid]));
    await saveAssign(sh._id, ids);
    closePicker();
  };

  const removeAssignee = async (shiftId: string, userId: string) => {
    const sh = shifts.find((s) => s._id === shiftId);
    if (!sh) return;
    const ids = sh.assignments.map((a) => a.userId).filter((id) => id !== userId);
    await saveAssign(shiftId, ids);
  };

  const undo = async () => {
    const last = undoStack.current.pop();
    if (!last) return;
    await saveAssign(last.shiftId, last.prev);
    setToast({ open: true, msg: 'Undo applied.' });
  };

  // Drag-select to select multiple shifts (bulk)
  const toggleSelect = (id: string, multi = false) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (!multi && !next.has(id)) return new Set([id]);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkRemove = async () => {
    for (const id of selected) {
      const sh = shifts.find((s) => s._id === id);
      if (!sh) continue;
      await saveAssign(id, []);
    }
    setSelected(new Set());
  };

  const bulkAssign = async (uid: string) => {
    for (const id of selected) {
      const sh = shifts.find((s) => s._id === id);
      if (!sh) continue;
      const ids = Array.from(new Set([...sh.assignments.map((a) => a.userId), uid]));
      await saveAssign(id, ids);
    }
    setSelected(new Set());
  };

  return (
    <>
      <Paper id="plan-import" sx={{ p: 2, mb: 2, scrollMarginTop: 96 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <Typography variant="subtitle1" sx={{ flex: 1 }}>
            Manage templates on the Shifts page. Import them into this schedule:
          </Typography>
          <Button variant="outlined" onClick={generateFromPlan}>
            Import from Shifts
          </Button>
        </Stack>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Paper sx={{ p: 2, minWidth: 260 }}>
          <Typography variant="subtitle1">Staff</Typography>
          <Stack spacing={1}>
            {staff.map((u) => (
              <Box
                key={u._id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('staffId', u._id)}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'grab',
                }}
              >
                {displayName(u)}
                <Typography variant="caption" sx={{ display: 'block' }}>
                  {(hoursByUser[u._id] || 0).toFixed(1)} hrs
                </Typography>
              </Box>
            ))}
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Bulk actions</Typography>
          <Button
            size="small"
            onClick={() => setPicker((p) => ({ ...p, open: true, shift: undefined as any }))}
          >
            Assign selected…
          </Button>
          <Button size="small" onClick={bulkRemove}>
            Clear selected
          </Button>
          <Divider sx={{ my: 2 }} />
          <Button variant="outlined" onClick={undo}>
            Undo
          </Button>
        </Paper>
        <Stack flex={1} spacing={2}>
          {shifts.map((shift) => (
            <Paper
              key={shift._id}
              sx={{
                p: 2,
                minHeight: 120,
                outline: selected.has(shift._id) ? '2px solid #6C63FF' : 'none',
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(shift._id, e.dataTransfer.getData('staffId'))}
              onMouseDown={(e) => {
                draggingSelect.current = e.shiftKey;
                toggleSelect(shift._id, e.shiftKey);
              }}
              onMouseEnter={() => {
                if (draggingSelect.current) setSelected((prev) => new Set([...prev, shift._id]));
              }}
              onMouseUp={() => {
                draggingSelect.current = false;
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="subtitle1" sx={{ flex: 1 }}>
                  {new Date(shift.date).toDateString()} • {shift.start}-{shift.end}
                </Typography>
                {coverage[shift._id] === 'under' && (
                  <Chip
                    color="warning"
                    label={`Under: ${shift.assignments.length}/${shift.requiredCount}`}
                  />
                )}
                {coverage[shift._id] === 'over' && (
                  <Chip
                    color="error"
                    label={`Over: ${shift.assignments.length}/${shift.requiredCount}`}
                  />
                )}
                {coverage[shift._id] === 'ok' && <Chip color="success" label="Covered" />}
                <Button
                  size="small"
                  onClick={() =>
                    setSelected((prev) => {
                      const next = new Set(prev);
                      next.add(shift._id);
                      return next;
                    })
                  }
                >
                  Select
                </Button>
                <Button
                  size="small"
                  onClick={() => setPicker({ open: true, shift, replacing: null, q: '' })}
                >
                  Add
                </Button>
                <Button
                  size="small"
                  onClick={() =>
                    setTimeEdit({ open: true, id: shift._id, start: shift.start, end: shift.end })
                  }
                >
                  Edit Time
                </Button>
                <Button
                  size="small"
                  onClick={async () => {
                    await fetch('/api/shifts/copy', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ id: shift._id }),
                    });
                    await load();
                    setToast({ open: true, msg: 'Shift copied' });
                  }}
                >
                  Copy
                </Button>
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {shift.assignments.map((a) => {
                  const u = staff.find((s) => s._id === a.userId || s.email === a.userId);
                  const hours = hoursBetween(shift.start, shift.end);
                  const total = hoursByUser[a.userId] || 0;
                  const overtime = total > 40;
                  return (
                    <Chip
                      key={a.userId}
                      label={`${u ? displayName(u) : shortId(a.userId)}${overtime ? ' • OT' : ''}`}
                      color={overtime ? 'warning' : 'default'}
                      onDelete={() => removeAssignee(shift._id, a.userId)}
                      onClick={() => setPicker({ open: true, shift, replacing: a.userId, q: '' })}
                    />
                  );
                })}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {(conflicts[shift._id] || []).map((c, i) => (
                  <Tooltip key={i} title={c}>
                    <Chip color="warning" label="Conflict" size="small" />
                  </Tooltip>
                ))}
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Stack>

      <Dialog
        open={picker.open}
        onClose={() => setPicker({ open: false, replacing: null, q: '' })}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {picker.shift
            ? picker.replacing
              ? 'Replace staff'
              : 'Add staff'
            : 'Bulk assign to selected shifts'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search"
            value={picker.q}
            onChange={(e) => setPicker((p) => ({ ...p, q: e.target.value }))}
            sx={{ my: 1 }}
          />
          <Stack spacing={1} sx={{ mt: 1 }}>
            {(picker.shift ? eligible : staff)
              .filter((u) =>
                displayName(u)
                  .toLowerCase()
                  .includes((picker.q || '').toLowerCase()),
              )
              .map((u) => (
                <Button
                  key={u._id}
                  variant="outlined"
                  onClick={() => (picker.shift ? addFromPicker(u._id) : bulkAssign(u._id))}
                >
                  {displayName(u)}
                </Button>
              ))}
            {!picker.shift && staff.length === 0 && (
              <Typography color="text.secondary">No staff.</Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPicker({ open: false, replacing: null, q: '' })}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Mobile-friendly time editor */}
      <Dialog
        open={timeEdit.open}
        onClose={() => setTimeEdit({ open: false, start: '', end: '' })}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Edit Shift Time</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="time"
              label="Start"
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              value={timeEdit.start}
              onChange={(e) => setTimeEdit((p) => ({ ...p, start: e.target.value }))}
            />
            <TextField
              type="time"
              label="End"
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              value={timeEdit.end}
              onChange={(e) => setTimeEdit((p) => ({ ...p, end: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimeEdit({ open: false, start: '', end: '' })}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!timeEdit.id) return;
              const r = await fetch(`/api/shifts/${timeEdit.id}/time`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ start: timeEdit.start, end: timeEdit.end }),
              });
              if (r.ok) {
                await load();
                setToast({ open: true, msg: 'Shift updated' });
                setTimeEdit({ open: false, start: '', end: '' });
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ open: false, msg: '' })}
      >
        <Alert severity="success" variant="filled">
          {toast.msg}
        </Alert>
      </Snackbar>
    </>
  );
}
