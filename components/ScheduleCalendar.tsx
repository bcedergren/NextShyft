'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Box,
  Button,
  IconButton,
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
  Tooltip,
} from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useToast } from '@/components/ToastProvider';

type Shift = {
  _id: string;
  date: string;
  start: string;
  end: string;
  positionId: string;
  requiredCount: number;
  assignments: { userId: string }[];
};

type ScheduleCalendarProps = {
  positionId?: string;
  // Optional DOM id to render the staff list externally (e.g., in a left sidebar)
  staffListContainerId?: string;
  includeManagers?: boolean;
};

export default function ScheduleCalendar({
  positionId,
  staffListContainerId,
  includeManagers: includeManagersProp,
}: ScheduleCalendarProps) {
  // Helpers for eligibility
  const normIds = (val: any): string[] => {
    if (!val) return [];
    const arr = Array.isArray(val) ? val : [val];
    return arr
      .map((v) => {
        if (!v) return '';
        if (typeof v === 'string') return v;
        if (typeof (v as any).toHexString === 'function') return (v as any).toHexString();
        const id = (v as any)._id || (v as any).id || (v as any).$oid || (v as any).toString?.();
        try {
          return String(id || '');
        } catch {
          return '';
        }
      })
      .filter(Boolean) as string[];
  };
  const userHasPosition = (u: any, pid: string): boolean => {
    if (!u || !pid) return false;
    const positions = normIds((u as any).positions || (u as any).positionIds);
    return positions.includes(String(pid));
  };
  const [monthStart, setMonthStart] = useState(() => {
    const d = new Date();
    const start = new Date(d.getFullYear(), d.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    return start;
  });
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [staff, setStaff] = useState<
    Array<{
      _id: string;
      name?: string;
      email: string;
      positions?: string[];
      roles?: string[];
    }>
  >([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [assignSel, setAssignSel] = useState<Record<string, boolean>>({});
  const [timeForm, setTimeForm] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const today = useMemo(() => new Date(), []);
  const [hoverShiftId, setHoverShiftId] = useState<string | null>(null);
  const [draggingAssignment, setDraggingAssignment] = useState(false);
  const [unassignHover, setUnassignHover] = useState(false);
  // Track which staff is currently being dragged (from list or from a shift)
  const [dragStaffId, setDragStaffId] = useState<string | null>(null);
  // Fallback mode: click a name to select, then click a target shift to move
  const [pendingMove, setPendingMove] = useState<{
    staffId: string;
    fromShiftId: string;
  } | null>(null);
  const shiftRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  // include-managers controlled by parent if provided
  const includeManagers = includeManagersProp ?? false;
  const [schedules, setSchedules] = useState<any[]>([]);
  const [hasSchedForVisibleMonth, setHasSchedForVisibleMonth] = useState<boolean>(true);
  const toast = useToast();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [positions, setPositions] = useState<Array<{ _id: string; name?: string }>>([]);
  const [staffSlot, setStaffSlot] = useState<Element | null>(null);
  // Track the current drag context and whether a drop completed to enable a dragEnd fallback
  const dragContextRef = useRef<{ staffId: string; fromShiftId?: string; label?: string } | null>(
    null,
  );
  const dropCompletedRef = useRef<boolean>(false);

  // Small util to show a person's display name
  const displayName = (u: { name?: string; email?: string; _id?: string } | undefined | null) =>
    (u?.name || u?.email || u?._id || '').toString();

  // Parse a shift date string as a local calendar day to avoid timezone drift
  const parseShiftDate = (input: string | Date | undefined | null): Date | null => {
    if (!input) return null;
    if (input instanceof Date) return input;
    const s = String(input);
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]) - 1;
      const d = Number(m[3]);
      return new Date(y, mo, d); // local noon not needed; date-only is fine
    }
    const dt = new Date(s);
    return isNaN(dt.getTime()) ? null : dt;
  };

  // Compute day-of-week for a civil date without relying on JS Date TZ quirks (0=Sun..6=Sat)
  const dayOfWeek = (year: number, month1Based: number, day: number) => {
    let y = year;
    let m = month1Based;
    if (m < 3) {
      y -= 1;
      m += 12;
    }
    const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
    const w =
      (y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) + t[m - 1] + day) % 7;
    return (w + 7) % 7;
  };

  // Filter staff by position with optional manager inclusion
  const { filteredStaff, isFiltering } = useMemo(() => {
    if (!positionId) return { filteredStaff: staff, isFiltering: false };
    const pid = String(positionId);
    const eligible = staff.filter((u) => {
      const userPositions = normIds((u as any).positions || (u as any).positionIds);
      const matchesPosition = userPositions.includes(pid);
      const rolesArr = Array.isArray((u as any).roles)
        ? ((u as any).roles as any[])
        : (u as any).roles
          ? [String((u as any).roles)]
          : [];
      const isManager = rolesArr.some((r) => String(r || '').toUpperCase() === 'MANAGER');
      return matchesPosition || (includeManagers && isManager);
    });
    return { filteredStaff: eligible, isFiltering: true };
  }, [staff, positionId, includeManagers]);
  const listForUI = isFiltering ? filteredStaff : staff;

  const load = async () => {
    const scheds = await (await fetch('/api/schedules')).json();
    setSchedules(Array.isArray(scheds) ? scheds : []);

    // Use the newest schedule without altering the visible month
    const sched = Array.isArray(scheds) && scheds.length > 0 ? scheds[0] : null;
    // Track whether a schedule exists for the visible month (for empty state only)
    if (Array.isArray(scheds)) {
      const visible = monthStart;
      const hasForMonth = scheds.some((s: any) => {
        const ps = new Date(s.periodStart);
        const pe = new Date(s.periodEnd);
        ps.setHours(0, 0, 0, 0);
        pe.setHours(23, 59, 59, 999);
        return ps <= visible && visible <= pe;
      });
      setHasSchedForVisibleMonth(hasForMonth);
    } else {
      setHasSchedForVisibleMonth(false);
    }
    if (!sched) return setShifts([]);
    const posParam = positionId ? `&positionId=${encodeURIComponent(positionId)}` : '';
    let items = await (await fetch(`/api/shifts?scheduleId=${sched._id}${posParam}`)).json();
    // Extra safety: client-side filter in case of backend type mismatches
    if (positionId) {
      const pid = String(positionId);
      const norm = (v: any) => {
        if (!v) return '';
        if (typeof v === 'string') return v;
        if (typeof v === 'object') {
          const id = (v as any).toString?.() || (v as any)._id || (v as any).id || (v as any).$oid;
          return String(id || v);
        }
        return String(v);
      };
      items = Array.isArray(items) ? items.filter((s: any) => norm(s.positionId) === pid) : items;
    }
    setShifts(items || []);
    // Always fetch all org users; apply strict filtering client-side
    const users = await (await fetch(`/api/users`)).json();
    setStaff(users || []);
  };

  // Fetch positions once for label lookup
  useEffect(() => {
    (async () => {
      try {
        const list = await (await fetch('/api/positions')).json();
        if (Array.isArray(list)) setPositions(list);
      } catch {}
    })();
  }, []);

  // Locate external container for staff list (if provided)
  useEffect(() => {
    if (!staffListContainerId) {
      setStaffSlot(null);
      return;
    }
    if (typeof window === 'undefined') return;
    const el = document.getElementById(staffListContainerId) || null;
    setStaffSlot(el);
  }, [staffListContainerId]);

  const positionNameFor = (id?: string) => {
    if (!id) return '';
    const item = positions.find((p) => String(p._id) === String(id));
    return item?.name || '';
  };

  useEffect(() => {
    load();
  }, [positionId, includeManagers]);

  // Recompute empty state (without refetching) when the visible month changes
  useEffect(() => {
    if (!Array.isArray(schedules) || schedules.length === 0) {
      setHasSchedForVisibleMonth(false);
      return;
    }
    const visible = monthStart;
    const hasForMonth = schedules.some((s: any) => {
      const ps = new Date(s.periodStart);
      const pe = new Date(s.periodEnd);
      ps.setHours(0, 0, 0, 0);
      pe.setHours(23, 59, 59, 999);
      return ps <= visible && visible <= pe;
    });
    setHasSchedForVisibleMonth(hasForMonth);
  }, [monthStart, schedules]);

  const createScheduleForVisibleMonth = async () => {
    const y = monthStart.getFullYear();
    const m = monthStart.getMonth();
    const periodStart = new Date(y, m, 1);
    const periodEnd = new Date(y, m + 1, 0);
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periodStart, periodEnd }),
    });
    if (res.ok) {
      await load();
    }
  };

  const shiftsByDay = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    const days = (() => {
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
      const d = parseShiftDate(s.date);
      const key = d ? d.toDateString() : new Date(s.date as any).toDateString();
      if (map[key]) map[key].push(s);
    }
    // sort by start time
    Object.values(map).forEach((list) =>
      list.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0)),
    );
    return map;
  }, [shifts, monthStart]);

  const coverageFor = (s: Shift) => {
    const count = s.assignments?.length || 0;
    if (count < (s.requiredCount || 0))
      return { label: `Under: ${count}/${s.requiredCount}`, color: 'warning' as const };
    if (count > (s.requiredCount || 0))
      return { label: `Over: ${count}/${s.requiredCount}`, color: 'error' as const };
    return { label: 'Covered', color: 'success' as const };
  };

  // Build a compact drag image so there is no large transparent box to the right
  const setCustomDragImage = (evt: any, text: string) => {
    try {
      if (typeof document === 'undefined' || !evt?.dataTransfer?.setDragImage) return;
      const ghost = document.createElement('div');
      ghost.textContent = text || '';
      ghost.style.position = 'fixed';
      ghost.style.top = '-1000px';
      ghost.style.left = '-1000px';
      ghost.style.pointerEvents = 'none';
      ghost.style.padding = '4px 8px';
      ghost.style.fontSize = '12px';
      ghost.style.lineHeight = '18px';
      ghost.style.borderRadius = '4px';
      ghost.style.background = 'rgba(75,85,99,0.95)';
      ghost.style.color = '#fff';
      ghost.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';
      ghost.style.whiteSpace = 'nowrap';
      ghost.style.maxWidth = '260px';
      ghost.style.textOverflow = 'ellipsis';
      document.body.appendChild(ghost);
      evt.dataTransfer.setDragImage(ghost, 8, 12);
      // Cleanup on next tick
      setTimeout(() => {
        if (ghost && ghost.parentNode) ghost.parentNode.removeChild(ghost);
      }, 0);
    } catch {}
  };

  // Normalize various id shapes to a comparable string
  const idToString = (v: any): string => {
    if (!v) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'object') {
      const t = (v as any).toString?.();
      const id = (v as any)._id || (v as any).id || (v as any).$oid;
      try {
        return String(t || id || v);
      } catch {
        return '';
      }
    }
    try {
      return String(v);
    } catch {
      return '';
    }
  };

  // Find the shift box under a screen point (e.g., when dropping on whitespace)
  const getShiftIdAtPoint = (clientX: number, clientY: number): string | null => {
    let hit: { id: string; area: number } | null = null;
    for (const [id, el] of shiftRefs.current.entries()) {
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;
      if (inside) {
        const area = rect.width * rect.height;
        if (!hit || area < hit.area) hit = { id, area };
      }
    }
    return hit ? hit.id : null;
  };

  // Fallback: if the browser doesn't fire onDrop reliably, finalize a move on dragEnd
  const finalizeMoveOnDragEnd = async () => {
    try {
      if (dropCompletedRef.current) return; // a drop already handled it
      const ctx = dragContextRef.current;
      if (!ctx) return;
      const targetShiftId = hoverShiftId;
      if (!targetShiftId) return;
      const s = (shifts || []).find((x) => x._id === targetShiftId);
      if (!s) return;
      const person = staff.find((u) => u._id === ctx.staffId || u.email === ctx.staffId);
      const eligible = !!(person && userHasPosition(person, s.positionId));
      if (!eligible) {
        toast?.('Cannot assign: position mismatch', 'warning');
        dropCompletedRef.current = true; // prevent another attempt
      } else {
        // Add to target first; remove from origin only if not skipped
        const currentIds = (s.assignments || []).map((a) => idToString(a.userId));
        const nextIdsForTarget = Array.from(new Set([...currentIds, idToString(ctx.staffId)]));
        const resp = await fetch('/api/shifts/assign', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shiftId: s._id, staffIds: nextIdsForTarget }),
        });
        let added = true;
        try {
          const r = await resp.json();
          if (r?.skipped?.length) {
            const names = r.skipped
              .map((x: any) => {
                const u = staff.find((p) => p._id === x.id || p.email === x.id);
                return u ? u.name || u.email : x.id;
              })
              .join(', ');
            toast?.(`${names} unavailable for this shift`, 'warning');
            added = !r.skipped.some((x: any) => idToString(x.id) === idToString(ctx.staffId));
          }
        } catch {}
        if (added && ctx.fromShiftId && ctx.fromShiftId !== s._id) {
          const fromShift = (shifts || []).find((sh) => sh._id === ctx.fromShiftId);
          if (fromShift) {
            const nextIds = (fromShift.assignments || [])
              .map((a) => idToString(a.userId))
              .filter((id) => id !== idToString(ctx.staffId));
            await fetch('/api/shifts/assign', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ shiftId: ctx.fromShiftId, staffIds: nextIds }),
            });
          }
        }
        await load();
      }
    } catch {}
    // Always clear drag state after fallback attempt
    dragContextRef.current = null;
    dropCompletedRef.current = false;
    setDraggingAssignment(false);
    setHoverShiftId(null);
    setDragStaffId(null);
    setPendingMove(null);
  };

  return (
    <Stack spacing={2}>
      {(() => {
        const content = (
          <Box
            sx={{
              p: 1,
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 1,
              '@media print': { display: 'none' },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle2">
                Staff — drag onto a shift to assign
                {isFiltering ? (
                  <>
                    {' '}
                    <Typography component="span" variant="caption" color="text.secondary">
                      (filtered by position{includeManagers ? ' + managers' : ''},{' '}
                      {filteredStaff.length} shown)
                    </Typography>
                  </>
                ) : null}
              </Typography>
            </Stack>
            <Stack
              direction={staffSlot ? 'column' : 'row'}
              spacing={1}
              sx={{
                // When rendered in the sidebar (staffSlot), do not trap scroll; let the page scroll.
                overflowX: staffSlot ? 'visible' : 'auto',
                overflowY: staffSlot ? 'visible' : 'hidden',
              }}
            >
              {isFiltering && staff.length > 0 && filteredStaff.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
                  No employees eligible for this position.
                </Typography>
              ) : null}
              {listForUI.map((u) => (
                <Box
                  key={u._id}
                  component="span"
                  draggable
                  onDragStart={(e) => {
                    try {
                      e.dataTransfer.effectAllowed = 'copyMove';
                      e.dataTransfer.setData('staffId', u._id);
                      const payload = JSON.stringify({ staffId: u._id });
                      e.dataTransfer.setData('text/plain', payload);
                      e.dataTransfer.setData('text', payload);
                      e.dataTransfer.setData('Text', payload);
                      // Use compact drag image to avoid transparent box
                      setCustomDragImage(e, u.name || u.email || u._id);
                      // debug log removed
                      setDragStaffId(u._id);
                      dragContextRef.current = { staffId: u._id, label: u.name || u.email };
                      dropCompletedRef.current = false;
                    } catch {}
                  }}
                  onDragEnd={async () => {
                    await finalizeMoveOnDragEnd();
                    setDragStaffId(null);
                  }}
                  sx={{ display: 'inline-block', cursor: 'grab' }}
                >
                  <Chip label={u.name || u.email} />
                </Box>
              ))}
            </Stack>
          </Box>
        );
        // If external container exists, portal the staff content there; otherwise render inline
        return staffSlot ? createPortal(content, staffSlot) : content;
      })()}
      {/* Month Navigation (match employee pages); hidden on print */}
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
            onClick={() => setMonthStart((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography variant="h6" sx={{ minWidth: 180, textAlign: 'center' }}>
            {new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toLocaleDateString(
              undefined,
              { month: 'long', year: 'numeric' },
            )}
          </Typography>
          <IconButton
            aria-label="Next month"
            onClick={() => setMonthStart((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            <ArrowForwardIosIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>

      {/* Click-to-move helper bar */}
      {pendingMove && (
        <Box
          sx={{
            mt: 1,
            p: 1,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            '@media print': { display: 'none' },
          }}
        >
          <Typography variant="body2" sx={{ flex: 1 }}>
            Select a shift to move this assignment.
          </Typography>
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={async () => {
              try {
                const fromShift = (shifts || []).find((sh) => sh._id === pendingMove.fromShiftId);
                if (fromShift) {
                  const nextIds = (fromShift.assignments || [])
                    .map((a) => a.userId)
                    .filter((id) => id !== pendingMove.staffId);
                  await fetch('/api/shifts/assign', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shiftId: fromShift._id, staffIds: nextIds }),
                  });
                  await load();
                  toast?.('Unassigned', 'success');
                }
              } catch {}
              setPendingMove(null);
              setDragStaffId(null);
            }}
          >
            Unassign
          </Button>
          <Button
            size="small"
            onClick={() => {
              setPendingMove(null);
              setDragStaffId(null);
            }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Unassign drop zone (appears when dragging an assigned staff) */}
      {draggingAssignment && (
        <Box
          onDragOverCapture={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              e.dataTransfer.dropEffect = 'copy';
            } catch {}
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            try {
              e.dataTransfer.dropEffect = 'copy';
            } catch {}
            setUnassignHover(true);
          }}
          onDragLeave={() => setUnassignHover(false)}
          onDragEnter={(e) => {
            e.stopPropagation();
            try {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
            } catch {}
          }}
          onDrop={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropCompletedRef.current = true;
            setUnassignHover(false);
            try {
              const raw =
                e.dataTransfer.getData('text/plain') ||
                e.dataTransfer.getData('text') ||
                e.dataTransfer.getData('Text') ||
                '';
              const data = JSON.parse(raw || '{}');
              const fromShiftId = data.fromShiftId as string | undefined;
              const staffId =
                (data.staffId as string | undefined) || e.dataTransfer.getData('staffId');
              // debug log removed
              if (fromShiftId && staffId) {
                const fromShift = (shifts || []).find((sh) => sh._id === fromShiftId);
                if (fromShift) {
                  const nextIds = (fromShift.assignments || [])
                    .map((a) => a.userId)
                    .filter((id) => id !== staffId);
                  await fetch('/api/shifts/assign', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shiftId: fromShiftId, staffIds: nextIds }),
                  });
                  await load();
                }
              }
            } catch {}
            setDraggingAssignment(false);
            setDragStaffId(null);
          }}
          sx={{
            // Fixed overlay so it doesn't push content down during drag
            position: 'fixed',
            left: 0,
            right: 0,
            top: 8,
            mx: 'auto',
            width: 'max-content',
            p: 1.5,
            border: '2px dashed',
            borderColor: unassignHover ? 'error.main' : 'divider',
            borderRadius: 1,
            textAlign: 'center',
            color: unassignHover ? 'error.main' : 'text.secondary',
            bgcolor: 'background.paper',
            boxShadow: 2,
            transition: 'all 120ms ease',
            zIndex: (t) => t.zIndex.modal + 1,
            '@media print': { display: 'none' },
          }}
        >
          Drop here to unassign
        </Box>
      )}

      {/* Print-only centered month header */}
      <Box
        sx={{ display: 'none', '@media print': { display: 'block', textAlign: 'center', mb: 1.5 } }}
      >
        <Typography variant="h6" fontWeight={400} sx={{ color: '#374151' }}>
          {monthStart.toLocaleDateString?.(undefined, { month: 'long', year: 'numeric' })}
        </Typography>
      </Box>

      {(() => {
        const y = monthStart.getFullYear();
        const m = monthStart.getMonth();
        // Sunday-first calendar (Sun=0..Sat=6), computed in UTC to avoid TZ/DST drift
        const firstDow = new Date(Date.UTC(y, m, 1)).getUTCDay();
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const cells: Array<{ date: Date | null }> = [];
        for (let i = 0; i < firstDow; i++) cells.push({ date: null });
        for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(y, m, d, 12) });
        // pad to full weeks
        while (cells.length % 7 !== 0) cells.push({ date: null });
        if (!hasSchedForVisibleMonth) {
          return (
            <Box
              sx={{
                border: '1px dashed',
                borderColor: 'divider',
                p: 3,
                textAlign: 'center',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                No schedule exists for this month.
              </Typography>
              <Button variant="contained" size="small" onClick={createScheduleForVisibleMonth}>
                Create schedule
              </Button>
            </Box>
          );
        }
        return (
          <Box
            onDragOverCapture={(e) => {
              e.preventDefault();
              try {
                e.dataTransfer.dropEffect = 'copy';
              } catch {}
            }}
            onDrop={async (e) => {
              // Global fallback: if a specific shift didn't capture the drop, find nearest shift Box
              e.preventDefault();
              dropCompletedRef.current = true;
              const raw =
                e.dataTransfer.getData('text/plain') ||
                e.dataTransfer.getData('text') ||
                e.dataTransfer.getData('Text') ||
                '';
              let data: any = {};
              try {
                data = JSON.parse(raw || '{}');
              } catch {}
              const staffId = data.staffId || e.dataTransfer.getData('staffId');
              const fromShiftId = data.fromShiftId as string | undefined;
              if (!staffId) return;
              const target = e.target as HTMLElement | null;
              if (!target) return;
              let node: HTMLElement | null = target;
              let shiftId: string | null = null;
              while (node && !shiftId) {
                for (const [id, el] of shiftRefs.current.entries()) {
                  if (el && (el === node || el.contains(node))) {
                    shiftId = id;
                    break;
                  }
                }
                node = node.parentElement;
              }
              // If not directly over a shift element, hit-test by pointer location
              if (!shiftId) {
                shiftId = getShiftIdAtPoint(e.clientX, e.clientY);
              }
              if (!shiftId) return;
              const s = (shifts || []).find((x) => x._id === shiftId);
              if (!s) return;
              // Client-side position eligibility check before altering assignments
              const person = staff.find((u) => u._id === staffId || u.email === staffId);
              if (!person || !userHasPosition(person, s.positionId)) {
                toast?.('Cannot assign: position mismatch', 'warning');
                // Snap back to origin: clear drag state and prevent fallback
                dropCompletedRef.current = true;
                setDraggingAssignment(false);
                setHoverShiftId(null);
                setDragStaffId(null);
                setPendingMove(null);
                return;
              }
              // Add to target first; remove from origin only if not skipped
              const currentIds = (s.assignments || []).map((a) => idToString(a.userId));
              const nextIdsForTarget = Array.from(
                new Set([...currentIds, idToString(staffId as any)]),
              );
              const resp = await fetch('/api/shifts/assign', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shiftId: s._id, staffIds: nextIdsForTarget }),
              });
              let added = true;
              try {
                const r = await resp.json();
                if (r?.skipped?.length) {
                  const names = r.skipped
                    .map((x: any) => {
                      const u = staff.find((p) => p._id === x.id || p.email === x.id);
                      return u ? u.name || u.email : x.id;
                    })
                    .join(', ');
                  toast?.(`${names} unavailable for this shift`, 'warning');
                  added = !r.skipped.some((x: any) => idToString(x.id) === idToString(staffId));
                }
              } catch {}
              if (added && fromShiftId && fromShiftId !== s._id) {
                const fromShift = (shifts || []).find((sh) => sh._id === fromShiftId);
                if (fromShift) {
                  const nextIds = (fromShift.assignments || [])
                    .map((a) => idToString(a.userId))
                    .filter((id) => id !== idToString(staffId));
                  await fetch('/api/shifts/assign', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ shiftId: fromShiftId, staffIds: nextIds }),
                  });
                }
              }
              await load();
              setDragStaffId(null);
            }}
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
            {cells.map((c, idx) => (
              <Box
                key={idx}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1,
                  minHeight: 100,
                  position: 'relative',
                  '@media print': {
                    minHeight: 80,
                    bgcolor: 'transparent',
                    borderColor: '#e5e7eb',
                    breakInside: 'avoid',
                  },
                }}
              >
                {c.date && (
                  <>
                    {(() => {
                      const isToday =
                        c.date.getFullYear() === today.getFullYear() &&
                        c.date.getMonth() === today.getMonth() &&
                        c.date.getDate() === today.getDate();
                      const list = shiftsByDay[c.date.toDateString()] || [];
                      const hasShifts = list.length > 0;
                      return (
                        <Box
                          onDragOverCapture={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            try {
                              e.dataTransfer.dropEffect = 'copy';
                            } catch {}
                          }}
                          onDrop={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dropCompletedRef.current = true;
                            // When dropping on the day cell, select the shift under the cursor
                            let s: Shift | undefined;
                            const shiftId = getShiftIdAtPoint(e.clientX, e.clientY);
                            if (shiftId) {
                              s = (shifts || []).find((x) => x._id === shiftId);
                            } else {
                              // As a convenience, if exactly one shift exists, default to it
                              const listForDay = list;
                              if (Array.isArray(listForDay) && listForDay.length === 1) {
                                s = listForDay[0];
                              } else {
                                toast?.('Drop onto a specific shift card', 'info');
                                return;
                              }
                            }
                            const idA = e.dataTransfer.getData('staffId');
                            let parsed: any = {};
                            try {
                              const raw =
                                e.dataTransfer.getData('text/plain') ||
                                e.dataTransfer.getData('text') ||
                                e.dataTransfer.getData('Text') ||
                                '';
                              parsed = JSON.parse(raw || '{}');
                            } catch {}
                            const staffId = idA || parsed.staffId;
                            const fromShiftId = parsed.fromShiftId as string | undefined;
                            // debug log removed
                            if (!staffId || !s) return;
                            const person = staff.find(
                              (u) => u._id === staffId || u.email === staffId,
                            );
                            if (!person || !userHasPosition(person, s.positionId)) {
                              toast?.('Cannot assign: position mismatch', 'warning');
                              // Snap back to origin: clear drag state and prevent fallback
                              dropCompletedRef.current = true;
                              setDraggingAssignment(false);
                              setHoverShiftId(null);
                              setDragStaffId(null);
                              setPendingMove(null);
                              return;
                            }
                            // Add to target first; remove from origin only if not skipped
                            const currentIds = (s.assignments || []).map((a) =>
                              idToString(a.userId),
                            );
                            const nextIdsForTarget = Array.from(
                              new Set([...currentIds, idToString(staffId as any)]),
                            );
                            const resp = await fetch('/api/shifts/assign', {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ shiftId: s._id, staffIds: nextIdsForTarget }),
                            });
                            let added = true;
                            try {
                              const r = await resp.json();
                              if (r?.skipped?.length) {
                                const names = r.skipped
                                  .map((x: any) => {
                                    const u = staff.find((p) => p._id === x.id || p.email === x.id);
                                    return u ? u.name || u.email : x.id;
                                  })
                                  .join(', ');
                                toast?.(`${names} unavailable for this shift`, 'warning');
                                added = !r.skipped.some(
                                  (x: any) => idToString(x.id) === idToString(staffId),
                                );
                              }
                            } catch {}
                            if (added && fromShiftId && fromShiftId !== s._id) {
                              const fromShift = (shifts || []).find((sh) => sh._id === fromShiftId);
                              if (fromShift) {
                                const nextIds = (fromShift.assignments || [])
                                  .map((a) => idToString(a.userId))
                                  .filter((id) => id !== idToString(staffId));
                                await fetch('/api/shifts/assign', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ shiftId: fromShiftId, staffIds: nextIds }),
                                });
                              }
                            }
                            await load();
                            setDraggingAssignment(false);
                            setHoverShiftId((id) => (id === s._id ? null : id));
                            setDragStaffId(null);
                          }}
                        >
                          <Typography
                            variant="caption"
                            color={
                              isToday
                                ? 'primary.main'
                                : hasShifts
                                  ? 'primary.main'
                                  : 'text.secondary'
                            }
                            sx={{ fontWeight: isToday ? 700 : hasShifts ? 600 : 400 }}
                          >
                            {c.date.getDate()}
                          </Typography>
                          <Stack spacing={1} sx={{ mt: 0.5 }}>
                            {list.map((s) => {
                              const cov = coverageFor(s);
                              const dragPerson = dragStaffId
                                ? staff.find(
                                    (u) => u._id === dragStaffId || u.email === dragStaffId,
                                  )
                                : null;
                              const eligibleForThis = dragPerson
                                ? userHasPosition(dragPerson, s.positionId)
                                : true;
                              const showMismatchTip = !!(
                                dragStaffId &&
                                dragPerson &&
                                !eligibleForThis &&
                                hoverShiftId === s._id
                              );
                              return (
                                <Tooltip
                                  key={s._id}
                                  title={showMismatchTip ? 'Position mismatch' : ''}
                                  open={showMismatchTip}
                                  arrow
                                  placement="top"
                                  disableHoverListener
                                >
                                  <Box
                                    ref={(el) => {
                                      // Only store HTMLDivElement; clear otherwise
                                      shiftRefs.current.set(
                                        s._id,
                                        el && el instanceof HTMLDivElement ? el : null,
                                      );
                                    }}
                                    onDragOverCapture={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      try {
                                        e.dataTransfer.dropEffect = 'move';
                                      } catch {}
                                    }}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      try {
                                        e.dataTransfer.dropEffect = 'move';
                                      } catch {}
                                    }}
                                    onDragEnter={(e) => {
                                      e.stopPropagation();
                                      try {
                                        e.preventDefault();
                                        e.dataTransfer.dropEffect = 'move';
                                      } catch {}
                                      setHoverShiftId(s._id);
                                    }}
                                    onDragLeave={() =>
                                      setHoverShiftId((id) => (id === s._id ? null : id))
                                    }
                                    onDrop={async (e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      dropCompletedRef.current = true;
                                      const idA = e.dataTransfer.getData('staffId');
                                      let parsed: any = {};
                                      try {
                                        const raw =
                                          e.dataTransfer.getData('text/plain') ||
                                          e.dataTransfer.getData('text') ||
                                          e.dataTransfer.getData('Text') ||
                                          '';
                                        parsed = JSON.parse(raw || '{}');
                                      } catch {}
                                      const staffId = idA || parsed.staffId;
                                      const fromShiftId = parsed.fromShiftId as string | undefined;
                                      // debug log removed
                                      if (!staffId) return;
                                      const person = staff.find(
                                        (u) => u._id === staffId || u.email === staffId,
                                      );
                                      if (!person || !userHasPosition(person, s.positionId)) {
                                        toast?.('Cannot assign: position mismatch', 'warning');
                                        // Snap back to origin: clear drag state and prevent fallback
                                        dropCompletedRef.current = true;
                                        setDraggingAssignment(false);
                                        setHoverShiftId((id) => (id === s._id ? null : id));
                                        setDragStaffId(null);
                                        setPendingMove(null);
                                        return;
                                      }
                                      // Add to target first; remove from origin only if not skipped
                                      const currentIds = (s.assignments || []).map((a) =>
                                        idToString(a.userId),
                                      );
                                      const nextIdsForTarget = Array.from(
                                        new Set([...currentIds, idToString(staffId as any)]),
                                      );
                                      const resp = await fetch('/api/shifts/assign', {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          shiftId: s._id,
                                          staffIds: nextIdsForTarget,
                                        }),
                                      });
                                      let added = true;
                                      try {
                                        const r = await resp.json();
                                        if (r?.skipped?.length) {
                                          const names = r.skipped
                                            .map((x: any) => {
                                              const u = staff.find(
                                                (p) => p._id === x.id || p.email === x.id,
                                              );
                                              return u ? u.name || u.email : x.id;
                                            })
                                            .join(', ');
                                          toast?.(`${names} unavailable for this shift`, 'warning');
                                          added = !r.skipped.some(
                                            (x: any) => idToString(x.id) === idToString(staffId),
                                          );
                                        }
                                      } catch {}
                                      if (added && fromShiftId && fromShiftId !== s._id) {
                                        const fromShift = (shifts || []).find(
                                          (sh) => sh._id === fromShiftId,
                                        );
                                        if (fromShift) {
                                          const nextIds = (fromShift.assignments || [])
                                            .map((a) => idToString(a.userId))
                                            .filter((id) => id !== idToString(staffId));
                                          await fetch('/api/shifts/assign', {
                                            method: 'PUT',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                              shiftId: fromShiftId,
                                              staffIds: nextIds,
                                            }),
                                          });
                                        }
                                      }
                                      await load();
                                      setDraggingAssignment(false);
                                      setHoverShiftId((id) => (id === s._id ? null : id));
                                      setDragStaffId(null);
                                    }}
                                    onClick={async () => {
                                      // If a pending move is active, treat clicking a shift as the target
                                      if (pendingMove) {
                                        const staffId = pendingMove.staffId;
                                        const fromShiftId = pendingMove.fromShiftId;
                                        const person = staff.find(
                                          (u) => u._id === staffId || u.email === staffId,
                                        );
                                        if (!person || !userHasPosition(person, s.positionId)) {
                                          toast?.('Cannot assign: position mismatch', 'warning');
                                          return;
                                        }
                                        // Add to target first; remove from origin only if assignment was accepted
                                        const currentIds = (s.assignments || []).map((a) =>
                                          idToString(a.userId),
                                        );
                                        const nextIdsForTarget = Array.from(
                                          new Set([...currentIds, idToString(staffId)]),
                                        );
                                        const resp = await fetch('/api/shifts/assign', {
                                          method: 'PUT',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({
                                            shiftId: s._id,
                                            staffIds: nextIdsForTarget,
                                          }),
                                        });
                                        let added = true;
                                        try {
                                          const r = await resp.json();
                                          if (r?.skipped?.length) {
                                            const names = r.skipped
                                              .map((x: any) => {
                                                const u = staff.find(
                                                  (p) => p._id === x.id || p.email === x.id,
                                                );
                                                return u ? u.name || u.email : x.id;
                                              })
                                              .join(', ');
                                            toast?.(
                                              `${names} unavailable for this shift`,
                                              'warning',
                                            );
                                            added = !r.skipped.some(
                                              (x: any) => idToString(x.id) === idToString(staffId),
                                            );
                                          }
                                        } catch {}
                                        if (added && fromShiftId && fromShiftId !== s._id) {
                                          const fromShift = (shifts || []).find(
                                            (sh) => sh._id === fromShiftId,
                                          );
                                          if (fromShift) {
                                            const nextIds = (fromShift.assignments || [])
                                              .map((a) => idToString(a.userId))
                                              .filter((id) => id !== idToString(staffId));
                                            await fetch('/api/shifts/assign', {
                                              method: 'PUT',
                                              headers: { 'Content-Type': 'application/json' },
                                              body: JSON.stringify({
                                                shiftId: fromShiftId,
                                                staffIds: nextIds,
                                              }),
                                            });
                                          }
                                        }
                                        await load();
                                        setPendingMove(null);
                                        setDragStaffId(null);
                                        return;
                                      }
                                      // Default: open manage dialog
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
                                      p: 0.75,
                                      borderRadius: 0.5,
                                      bgcolor: 'background.paper',
                                      color: 'text.primary',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      cursor: 'pointer',
                                      outline: 'none',
                                      boxShadow: (() => {
                                        if (hoverShiftId === s._id)
                                          return '0 0 0 2px rgba(59,130,246,0.4)';
                                        if (dragStaffId) {
                                          const person = staff.find(
                                            (u) => u._id === dragStaffId || u.email === dragStaffId,
                                          );
                                          if (person) {
                                            const ok = userHasPosition(person, s.positionId);
                                            return ok
                                              ? '0 0 0 2px rgba(34,197,94,0.45)'
                                              : '0 0 0 2px rgba(239,68,68,0.35)';
                                          }
                                        }
                                        return 'none';
                                      })(),
                                      '@media print': { bgcolor: 'transparent', color: 'inherit' },
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500, pointerEvents: 'none' }}
                                    >
                                      {s.start}–{s.end}
                                    </Typography>
                                    <Chip
                                      size="small"
                                      label={cov.label}
                                      color={cov.color}
                                      sx={{
                                        mt: 0.5,
                                        height: 20,
                                        fontSize: '0.7rem',
                                        pointerEvents: 'none',
                                      }}
                                    />
                                    <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                                      {(s.assignments || []).map((a) => {
                                        const person = staff.find(
                                          (u) => u._id === a.userId || u.email === a.userId,
                                        );
                                        const label = person ? displayName(person) : a.userId;
                                        return (
                                          <Box
                                            key={a.userId}
                                            draggable
                                            onDragStart={(e) => {
                                              setDraggingAssignment(true);
                                              try {
                                                const payload = JSON.stringify({
                                                  fromShiftId: s._id,
                                                  staffId: a.userId,
                                                });
                                                // Provide explicit staffId for robust drop handling
                                                e.dataTransfer.setData('staffId', String(a.userId));
                                                e.dataTransfer.setData('text/plain', payload);
                                                e.dataTransfer.setData('text', payload);
                                                e.dataTransfer.setData('Text', payload);
                                                e.dataTransfer.effectAllowed = 'copyMove';
                                                // Use compact drag image to avoid transparent box
                                                setCustomDragImage(e, label);
                                                // debug log removed
                                                setDragStaffId(String(a.userId));
                                                dragContextRef.current = {
                                                  staffId: String(a.userId),
                                                  fromShiftId: s._id,
                                                  label,
                                                };
                                                dropCompletedRef.current = false;
                                              } catch {}
                                            }}
                                            onTouchStart={() => {
                                              // Touch fallback: select for click-to-move
                                              setPendingMove({
                                                staffId: a.userId,
                                                fromShiftId: s._id,
                                              });
                                              setDragStaffId(String(a.userId));
                                            }}
                                            onDragEnd={async () => {
                                              await finalizeMoveOnDragEnd();
                                            }}
                                            onClick={(ev) => {
                                              ev.stopPropagation();
                                              // Toggle selection for click-to-move fallback
                                              setPendingMove((curr) => {
                                                if (
                                                  curr &&
                                                  curr.staffId === a.userId &&
                                                  curr.fromShiftId === s._id
                                                )
                                                  return null;
                                                return { staffId: a.userId, fromShiftId: s._id };
                                              });
                                              setDragStaffId(String(a.userId));
                                            }}
                                            // Avoid stopping mousedown so browsers can initiate drag reliably
                                            sx={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: 0.5,
                                              fontSize: '0.75rem',
                                              px: 0.5,
                                              py: 0.25,
                                              bgcolor:
                                                pendingMove &&
                                                pendingMove.staffId === a.userId &&
                                                pendingMove.fromShiftId === s._id
                                                  ? 'rgba(59,130,246,0.15)'
                                                  : 'rgba(0,0,0,0.06)',
                                              borderRadius: 0.5,
                                              maxWidth: '100%',
                                              whiteSpace: 'nowrap',
                                              overflow: 'hidden',
                                              textOverflow: 'ellipsis',
                                              cursor: 'grab',
                                              userSelect: 'none',
                                              WebkitUserSelect: 'none',
                                              MsUserSelect: 'none',
                                              WebkitUserDrag: 'element',
                                              // visual: keep chip visible while dragging; drop preview uses drag image
                                            }}
                                            title={label}
                                          >
                                            <DragIndicatorIcon
                                              fontSize="inherit"
                                              sx={{ opacity: 0.6, cursor: 'grab' }}
                                            />
                                            <span
                                              style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                              }}
                                            >
                                              {label}
                                            </span>
                                          </Box>
                                        );
                                      })}
                                    </Stack>
                                  </Box>
                                </Tooltip>
                              );
                            })}
                          </Stack>
                        </Box>
                      );
                    })()}
                  </>
                )}
              </Box>
            ))}
          </Box>
        );
      })()}

      {/* Assign staff dialog */}
      <Dialog open={assignOpen} onClose={() => setAssignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Manage Shift</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {(() => {
              if (!activeShift) return '';
              const d = parseShiftDate(activeShift.date);
              const dateLabel = d ? d.toDateString() : String(activeShift.date);
              return `${dateLabel} • ${activeShift.start}–${activeShift.end}`;
            })()}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {activeShift ? `Position: ${positionNameFor(activeShift.positionId)}` : ''}
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
              {listForUI.map((u) => (
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
          <Button color="error" onClick={() => setDeleteOpen(true)}>
            Delete Shift
          </Button>
          <Button onClick={() => setAssignOpen(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!activeShift) return;
              const selectedAll = Object.keys(assignSel).filter((id) => assignSel[id]);
              const eligible: string[] = [];
              const ineligible: string[] = [];
              for (const id of selectedAll) {
                const person = staff.find((u) => u._id === id || u.email === id);
                if (person && userHasPosition(person, activeShift.positionId)) eligible.push(id);
                else ineligible.push(id);
              }
              if (ineligible.length) {
                const names = ineligible
                  .map((x) => {
                    const u = staff.find((p) => p._id === x || p.email === x);
                    return u ? u.name || u.email : x;
                  })
                  .join(', ');
                toast?.(`Skipped (position mismatch): ${names}`, 'warning');
              }
              const resp = await fetch('/api/shifts/assign', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shiftId: activeShift._id, staffIds: eligible }),
              });
              try {
                const r = await resp.json();
                if (r?.skipped?.length) {
                  const names = r.skipped
                    .map((x: any) => {
                      const u = staff.find((p) => p._id === x.id || p.email === x.id);
                      return u ? u.name || u.email : x.id;
                    })
                    .join(', ');
                  toast?.(`${names} unavailable for this shift`, 'warning');
                }
              } catch {}
              await load();
              setAssignOpen(false);
            }}
          >
            Save Assignments
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete shift?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!activeShift) return;
              const r = await fetch(`/api/shifts/${activeShift._id}`, { method: 'DELETE' });
              if (r.ok) {
                setDeleteOpen(false);
                setAssignOpen(false);
                await load();
                toast?.('Shift deleted', 'success');
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
