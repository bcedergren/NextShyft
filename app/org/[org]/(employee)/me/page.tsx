'use client';
import AppShell from '@/components/AppShell';
// Top navigation is now provided by AppShell
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Menu, MenuItem, Divider } from '@mui/material';
import dayjs from 'dayjs';

type MyShift = { _id: string; date: string; start: string; end: string; positionName?: string };
type Block = { start: string; end: string; prefer?: boolean };

export default function MySchedule() {
  const [items, setItems] = useState<MyShift[]>([]);
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  // Removed direct-target email input; swaps default to offer type
  const [dates, setDates] = useState<Record<string, Block[]>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    const [shiftsRes, availRes] = await Promise.all([
      fetch('/api/my/shifts?month=' + month),
      fetch('/api/availability'),
    ]);
    const list = await shiftsRes.json();
    const avail = await availRes.json();
    setItems(list);
    setDates(avail.dates || {});
    setNotes(avail.notes || {});
  };
  useEffect(() => {
    load();
  }, [month]);

  const days = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const last = new Date(y, m, 0).getDate();
    const map: Record<number, MyShift[]> = {};
    for (let d = 1; d <= last; d++) map[d] = [];
    for (const s of items) {
      const dt = new Date(s.date);
      map[dt.getDate()].push(s);
    }
    return { first, last, map };
  }, [items, month]);

  const requestSwap = async (shiftId: string) => {
    await fetch('/api/swaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shiftId, type: 'offer', targetUserId: null }),
    });
    alert('Swap request submitted');
  };

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuDate, setMenuDate] = useState<string | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteDate, setNoteDate] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteDate, setDeleteDate] = useState<string | null>(null);

  const openDateMenu = (e: React.MouseEvent<HTMLElement>, dateStr: string) => {
    setMenuAnchor(e.currentTarget);
    setMenuDate(dateStr);
  };

  const closeDateMenu = () => {
    setMenuAnchor(null);
    setMenuDate(null);
  };

  const setUnavailable = async (dateStr: string, half: 'am' | 'pm' | 'all') => {
    const next = { ...dates };
    if (half === 'all') {
      next[dateStr] = [{ start: '00:00', end: '23:59' }];
    } else {
      next[dateStr] =
        half === 'am' ? [{ start: '00:00', end: '12:00' }] : [{ start: '12:00', end: '23:59' }];
    }
    await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: next, notes }),
    });
    setDates(next);
    closeDateMenu();
  };

  const clearUnavailable = async (dateStr: string) => {
    const next = { ...dates };
    delete next[dateStr];
    const nextNotes = { ...notes };
    delete nextNotes[dateStr];
    await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dates: next, notes: nextNotes }),
    });
    setDates(next);
    setNotes(nextNotes);
    closeDateMenu();
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">My Availability</Typography>
        <Typography variant="caption" color="text.secondary">
          Tip: Click a date to mark Unavailable AM/PM.
        </Typography>
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
            {dayjs(month + '-01').format('MMMM YYYY')}
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
          {/* Direct-to email and iCal button removed per request */}
        </Stack>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <Box key={d} sx={{ fontWeight: 600, textAlign: 'center' }}>
                {d}
              </Box>
            ))}
            {Array.from({ length: days.first.getDay() }, (_, i) => (
              <Box key={'x' + i} />
            ))}
            {Array.from({ length: days.last }, (_, i) => {
              const day = i + 1;
              const list = days.map[day];
              const dateStr = dayjs(new Date(month + '-01'))
                .date(day)
                .format('YYYY-MM-DD');
              const unavailableBlocks = dates[dateStr] || [];
              const hasAM = unavailableBlocks.some((b) => b.start < '12:00');
              const hasPM = unavailableBlocks.some((b) => b.end > '12:00');
              const isAllDay =
                unavailableBlocks.some((b) => b.start <= '00:00' && b.end >= '23:59') ||
                (hasAM && hasPM);
              const isUnavailable = isAllDay || hasAM || hasPM;
              return (
                <Box
                  key={day}
                  sx={{
                    border: '1px solid',
                    borderColor: isUnavailable ? 'error.light' : 'divider',
                    borderRadius: 1,
                    p: 1,
                    minHeight: 80,
                    pb: 4.5,
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  onClick={(e) => openDateMenu(e as any, dateStr)}
                >
                  {isAllDay ? (
                    <>
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          bgcolor: 'error.light',
                          opacity: 0.18,
                          borderRadius: 1,
                          pointerEvents: 'none',
                        }}
                      />
                      <CloseIcon
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'error.main',
                          fontSize: 48,
                          opacity: 0.4,
                          pointerEvents: 'none',
                          zIndex: 5,
                        }}
                      />
                    </>
                  ) : (
                    <>
                      {hasAM && (
                        <>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '50%',
                              bgcolor: 'error.light',
                              opacity: 0.12,
                              borderTopLeftRadius: 4,
                              borderTopRightRadius: 4,
                              pointerEvents: 'none',
                            }}
                          />
                          <CloseIcon
                            sx={{
                              position: 'absolute',
                              top: 6,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              color: 'error.main',
                              fontSize: 22,
                              opacity: 0.9,
                              pointerEvents: 'none',
                              zIndex: 5,
                            }}
                          />
                        </>
                      )}
                      {hasPM && (
                        <>
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              right: 0,
                              height: '50%',
                              bgcolor: 'error.light',
                              opacity: 0.12,
                              borderBottomLeftRadius: 4,
                              borderBottomRightRadius: 4,
                              pointerEvents: 'none',
                            }}
                          />
                          <CloseIcon
                            sx={{
                              position: 'absolute',
                              bottom: 6,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              color: 'error.main',
                              fontSize: 22,
                              opacity: 0.9,
                              pointerEvents: 'none',
                              zIndex: 5,
                            }}
                          />
                        </>
                      )}
                    </>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {day}
                  </Typography>
                  {list.map((s) => (
                    <Box
                      key={s._id}
                      sx={{ mt: 0.5, p: 0.5, bgcolor: 'action.selected', borderRadius: 0.5 }}
                    >
                      <Typography variant="body2">
                        {s.start}-{s.end} {s.positionName || ''}
                      </Typography>
                      <Button size="small" onClick={() => requestSwap(s._id)}>
                        Request swap
                      </Button>
                    </Box>
                  ))}
                </Box>
              );
            })}
          </Box>
        </Paper>
        {/* Notes list */}
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="subtitle1">Notes</Typography>
          </Stack>
          <Stack spacing={1}>
            {Object.entries(notes)
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([d, text]) => (
                <Box
                  key={d}
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {dayjs(d).format('MMM D, YYYY')}
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {text}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        onClick={() => {
                          setNoteDate(d);
                          setNoteDraft(text);
                          setNoteDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => {
                          setDeleteDate(d);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            {Object.keys(notes).length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No notes yet.
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeDateMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <MenuItem onClick={() => menuDate && setUnavailable(menuDate, 'am')}>
          Unavailable AM
        </MenuItem>
        <MenuItem onClick={() => menuDate && setUnavailable(menuDate, 'pm')}>
          Unavailable PM
        </MenuItem>
        <MenuItem onClick={() => menuDate && setUnavailable(menuDate, 'all')}>
          Unavailable All Day
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            if (!menuDate) return;
            setNoteDate(menuDate);
            setNoteDraft(notes[menuDate] || '');
            setNoteDialogOpen(true);
            closeDateMenu();
          }}
        >
          Add note…
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => menuDate && clearUnavailable(menuDate)}>Clear</MenuItem>
      </Menu>
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add note</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={noteDate || ''}
            type="text"
            fullWidth
            multiline
            minRows={3}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (!noteDate) return;
              const updated = { ...notes, [noteDate]: noteDraft } as Record<string, string>;
              setNotes(updated);
              await fetch('/api/availability', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: updated }),
              });
              setNoteDialogOpen(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete note?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Are you sure you want to delete the note for{' '}
            {deleteDate ? dayjs(deleteDate).format('MMM D, YYYY') : 'this date'}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!deleteDate) return;
              const next = { ...notes };
              delete next[deleteDate];
              setNotes(next);
              await fetch('/api/availability', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: next }),
              });
              setDeleteDialogOpen(false);
              setDeleteDate(null);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {/* Bottom navigation removed; now using top tabs in AppShell */}
    </AppShell>
  );
}
