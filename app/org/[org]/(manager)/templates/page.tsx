'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import CalendarGrid from '@/components/CalendarGrid';
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Tooltip,
  Collapse,
  Skeleton,
  Checkbox,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useToast } from '@/components/ToastProvider';

const dayOptions = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

export default function TemplatesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [form, setForm] = useState({
    positionId: '',
    dayOfWeek: ['fri'] as string[],
    start: '17:00',
    end: '22:00',
    requiredCount: 1,
  });
  const isOvernight = (start: string, end: string) => start > end;
  const hasTimeError = form.start === form.end;
  const canAdd = Boolean(
    form.positionId &&
      (form.dayOfWeek?.length || 0) > 0 &&
      !hasTimeError &&
      form.requiredCount >= 1,
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const toast = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [loading, setLoading] = useState<boolean>(true);
  const editHasTimeError = editing ? editForm.start === editForm.end : false;
  const canSaveEdit = editing
    ? Boolean(
        editForm.positionId &&
          editForm.dayOfWeek &&
          !editHasTimeError &&
          Number(editForm.requiredCount) >= 1,
      )
    : false;
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [dup, setDup] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [tpl, pos] = await Promise.all([
        fetch('/api/templates').then((r) => r.json()),
        fetch('/api/positions').then((r) => r.json()),
      ]);
      setItems(tpl);
      setPositions(pos);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!canAdd) return;
    const days = Array.isArray(form.dayOfWeek) ? form.dayOfWeek : [form.dayOfWeek as any];
    // Send sequentially to avoid hitting write rate limits
    for (const d of days) {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: form.positionId,
          dayOfWeek: d,
          start: form.start,
          end: form.end,
          requiredCount: form.requiredCount,
        }),
      });
      if (!res.ok) break;
    }
    load();
  };

  const copyTemplate = async (tpl: any) => {
    await fetch('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        positionId: tpl.positionId,
        dayOfWeek: tpl.dayOfWeek,
        start: tpl.start,
        end: tpl.end,
        requiredCount: tpl.requiredCount,
      }),
    });
    load();
    toast('Template copied', 'success');
  };

  const positionNameById = (id: string) =>
    positions.find((p: any) => String(p._id) === String(id))?.name || 'Position';

  const dayLabel = (val: string) => dayOptions.find((d) => d.value === val)?.label || val;
  const dayIndex = (val: string) => dayOptions.findIndex((d) => d.value === val);
  const sortedItems = items.slice().sort((a: any, b: any) => {
    const pa = positionNameById(a.positionId);
    const pb = positionNameById(b.positionId);
    const pn = String(pa).localeCompare(String(pb));
    if (pn !== 0) return pn;
    const di = dayIndex(a.dayOfWeek) - dayIndex(b.dayOfWeek);
    if (di !== 0) return di;
    const ti = String(a.start).localeCompare(String(b.start));
    return ti;
  });
  const groupedByPosition: { positionId: string; positionName: string; items: any[] }[] = (() => {
    const map: Record<string, any[]> = {};
    for (const t of sortedItems) {
      const key = String(t.positionId);
      if (!map[key]) map[key] = [];
      map[key].push(t);
    }
    return Object.entries(map)
      .map(([positionId, list]) => ({
        positionId,
        positionName: positionNameById(positionId),
        items: list,
      }))
      .sort((a, b) => String(a.positionName).localeCompare(String(b.positionName)));
  })();

  const calendarItems = useMemo(() => {
    return items.map((t) => ({
      id: t._id,
      day: t.dayOfWeek,
      start: t.start,
      end: t.end,
      title: `${positionNameById(t.positionId)} (${t.requiredCount})`,
    }));
  }, [items, positions]);

  const toggleGroup = (positionId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(positionId)) next.delete(positionId);
      else next.add(positionId);
      return next;
    });
  };

  const startEdit = (t: any) => {
    setEditing(t._id);
    setEditForm({
      positionId: t.positionId,
      dayOfWeek: t.dayOfWeek,
      start: t.start,
      end: t.end,
      requiredCount: t.requiredCount,
    });
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditForm({});
  };
  const saveEdit = async (id: string) => {
    await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditing(null);
    setEditForm({});
    load();
  };
  const remove = async (id: string) => {
    await fetch(`/api/templates/${id}`, { method: 'DELETE' });
    load();
    toast('Template deleted', 'success');
  };

  const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length < 2) return;
    const res = await fetch('/api/templates/bulk-delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      setSelected(new Set());
      setBulkOpen(false);
      load();
      toast('Templates deleted', 'success');
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Shifts</Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr 1fr 1fr auto',
            },
            gap: 2,
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
        >
          <TextField
            select
            label="Position"
            value={form.positionId}
            onChange={(e) => setForm({ ...form, positionId: e.target.value })}
          >
            {positions.map((p: any) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Day(s)"
            value={form.dayOfWeek}
            SelectProps={{
              multiple: true,
              renderValue: (selected) =>
                (selected as string[])
                  .map((v) => dayOptions.find((o) => o.value === v)?.label || v)
                  .join(', '),
            }}
            onChange={(e) => {
              const value = e.target.value;
              setForm({
                ...form,
                dayOfWeek: Array.isArray(value) ? (value as string[]) : [value as any],
              });
            }}
          >
            {dayOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            type="time"
            label="Start"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            value={form.start}
            onChange={(e) => setForm({ ...form, start: e.target.value })}
            error={hasTimeError}
            helperText={
              hasTimeError
                ? 'Start and end cannot be the same'
                : isOvernight(form.start, form.end)
                  ? 'Ends next day'
                  : ' '
            }
          />
          <TextField
            type="time"
            label="End"
            InputLabelProps={{ shrink: true }}
            inputProps={{ step: 300 }}
            value={form.end}
            onChange={(e) => setForm({ ...form, end: e.target.value })}
            error={hasTimeError}
            helperText={
              hasTimeError
                ? 'Start and end cannot be the same'
                : isOvernight(form.start, form.end)
                  ? 'Ends next day'
                  : ' '
            }
          />
          <TextField
            type="number"
            label="Required"
            value={form.requiredCount}
            onChange={(e) => setForm({ ...form, requiredCount: Number(e.target.value) })}
            inputProps={{ min: 1 }}
            helperText={form.requiredCount < 1 ? 'Minimum 1' : ' '}
          />
          <Button variant="contained" onClick={add} disabled={!canAdd}>
            Add
          </Button>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
            <Button
              size="small"
              variant={view === 'list' ? 'contained' : 'outlined'}
              onClick={() => setView('list')}
            >
              List
            </Button>
            <Button
              size="small"
              variant={view === 'calendar' ? 'contained' : 'outlined'}
              onClick={() => setView('calendar')}
            >
              Calendar
            </Button>
            <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
              {selected.size > 1 && (
                <Button
                  color="error"
                  size="small"
                  variant="contained"
                  onClick={() => setBulkOpen(true)}
                >
                  Delete selected ({selected.size})
                </Button>
              )}
              <Button
                size="small"
                startIcon={<CompareArrowsIcon />}
                onClick={() => setDupOpen(true)}
              >
                Duplicate position…
              </Button>
            </Stack>
          </Stack>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" width="30%" />
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
              <Skeleton variant="rectangular" height={28} />
            </Stack>
          ) : view === 'calendar' ? (
            <CalendarGrid items={calendarItems} />
          ) : sortedItems.length === 0 ? (
            <Typography color="text.secondary">No shift templates yet.</Typography>
          ) : (
            groupedByPosition.map((group) => (
              <Stack key={group.positionId} spacing={1} sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={() => toggleGroup(group.positionId)}
                    aria-label={collapsed.has(group.positionId) ? 'Expand' : 'Collapse'}
                  >
                    {collapsed.has(group.positionId) ? (
                      <ExpandMoreIcon fontSize="small" />
                    ) : (
                      <ExpandLessIcon fontSize="small" />
                    )}
                  </IconButton>
                  {(() => {
                    const ids = group.items.map((t) => String(t._id));
                    const selectedCount = ids.filter((id) => selected.has(id)).length;
                    const allChecked = ids.length > 0 && selectedCount === ids.length;
                    const someChecked = selectedCount > 0 && !allChecked;
                    return (
                      <Checkbox
                        checked={allChecked}
                        indeterminate={someChecked}
                        onChange={(e) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (checked) ids.forEach((id) => next.add(id));
                            else ids.forEach((id) => next.delete(id));
                            return next;
                          });
                        }}
                        sx={{ p: 0.5 }}
                      />
                    );
                  })()}
                  <Typography variant="subtitle1">{group.positionName}</Typography>
                </Stack>
                <Collapse in={!collapsed.has(group.positionId)} unmountOnExit>
                  {group.items.map((t) => (
                    <Stack
                      key={t._id}
                      direction="row"
                      spacing={2}
                      sx={{
                        py: 1,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      {editing !== t._id && (
                        <Checkbox
                          checked={selected.has(t._id)}
                          onChange={(e) =>
                            toggleSelect(t._id, (e.target as HTMLInputElement).checked)
                          }
                          sx={{ p: 0.5 }}
                        />
                      )}
                      {editing === t._id ? (
                        <>
                          <TextField
                            select
                            label="Position"
                            value={editForm.positionId}
                            onChange={(e) =>
                              setEditForm({ ...editForm, positionId: e.target.value })
                            }
                            sx={{ minWidth: 160 }}
                          >
                            {positions.map((p: any) => (
                              <MenuItem key={p._id} value={p._id}>
                                {p.name}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            select
                            label="Day"
                            value={editForm.dayOfWeek}
                            onChange={(e) =>
                              setEditForm({ ...editForm, dayOfWeek: e.target.value })
                            }
                            sx={{ minWidth: 120 }}
                          >
                            {dayOptions.map((opt) => (
                              <MenuItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            type="time"
                            label="Start"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            value={editForm.start}
                            onChange={(e) => setEditForm({ ...editForm, start: e.target.value })}
                            error={editHasTimeError}
                            helperText={
                              editHasTimeError
                                ? 'Start and end cannot be the same'
                                : isOvernight(editForm.start, editForm.end)
                                  ? 'Ends next day'
                                  : ' '
                            }
                            sx={{ width: 160 }}
                          />
                          <TextField
                            type="time"
                            label="End"
                            InputLabelProps={{ shrink: true }}
                            inputProps={{ step: 300 }}
                            value={editForm.end}
                            onChange={(e) => setEditForm({ ...editForm, end: e.target.value })}
                            error={editHasTimeError}
                            helperText={
                              editHasTimeError
                                ? 'Start and end cannot be the same'
                                : isOvernight(editForm.start, editForm.end)
                                  ? 'Ends next day'
                                  : ' '
                            }
                            sx={{ width: 160 }}
                          />
                          <TextField
                            type="number"
                            label="Required"
                            value={editForm.requiredCount}
                            onChange={(e) =>
                              setEditForm({ ...editForm, requiredCount: Number(e.target.value) })
                            }
                            inputProps={{ min: 1 }}
                            helperText={Number(editForm.requiredCount) < 1 ? 'Minimum 1' : ' '}
                            sx={{ width: 140 }}
                          />
                          <Button
                            variant="contained"
                            disabled={!canSaveEdit}
                            onClick={() => saveEdit(t._id)}
                          >
                            Save
                          </Button>
                          <Button variant="text" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Typography flex={1}>
                            {positionNameById(t.positionId)} • {dayLabel(t.dayOfWeek)} • {t.start}-
                            {t.end}
                          </Typography>
                          <Typography>{t.requiredCount} needed</Typography>
                          <Tooltip title="Copy">
                            <IconButton
                              size="small"
                              onClick={() => copyTemplate(t)}
                              aria-label="Copy"
                            >
                              <ContentCopyIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => startEdit(t)} aria-label="Edit">
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteId(t._id)}
                              aria-label="Delete"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  ))}
                </Collapse>
              </Stack>
            ))
          )}
        </Paper>

        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete template?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This action cannot be undone. Are you sure you want to permanently delete this shift
              template?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={async () => {
                if (deleteId) await remove(deleteId);
                setDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={bulkOpen} onClose={() => setBulkOpen(false)}>
          <DialogTitle>Delete selected templates?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You are about to delete {selected.size} templates. This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button
              color="error"
              variant="contained"
              onClick={bulkDelete}
              disabled={selected.size < 2}
            >
              Delete All
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={dupOpen} onClose={() => setDupOpen(false)}>
          <DialogTitle>Duplicate position schedule</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                select
                label="From position"
                value={dup.from}
                onChange={(e) => setDup((d) => ({ ...d, from: e.target.value }))}
              >
                {positions.map((p: any) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="To position"
                value={dup.to}
                onChange={(e) => setDup((d) => ({ ...d, to: e.target.value }))}
              >
                {positions.map((p: any) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDupOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!dup.from || !dup.to || dup.from === dup.to}
              onClick={async () => {
                const res = await fetch('/api/templates/duplicate-position', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sourcePositionId: dup.from, targetPositionId: dup.to }),
                });
                if (res.ok) {
                  setDupOpen(false);
                  setDup({ from: '', to: '' });
                  load();
                  toast('Position schedule duplicated', 'success');
                }
              }}
            >
              Duplicate
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </AppShell>
  );
}
