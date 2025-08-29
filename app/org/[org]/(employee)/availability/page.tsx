'use client';
import AppShell from '@/components/AppShell';
import { PageLayout } from '@/components/page';
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
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Menu, MenuItem } from '@mui/material';
import dayjs from 'dayjs';

type MyShift = { _id: string; date: string; start: string; end: string; positionName?: string };
type Block = { start: string; end: string; prefer?: boolean };

export default function MySchedule() {
  const [items, setItems] = useState<MyShift[]>([]);
  const [month, setMonth] = useState<string>(dayjs().add(1, 'month').format('YYYY-MM')); // default to next month
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

  // Today helpers to match MySchedule highlight (screen-only)
  const today = useMemo(() => new Date(), []);
  const isCurrentMonth = useMemo(() => {
    const [y, m] = month.split('-').map(Number);
    return today.getFullYear() === y && today.getMonth() === m - 1;
  }, [month, today]);

  // Match MySchedule month label for reuse in UI and print-only header
  const monthLabel = useMemo(() => dayjs(month + '-01').format('MMMM YYYY'), [month]);

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
      <PageLayout spacing={3}>
        {/* Header to match MySchedule styling; hidden on print */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3, '@media print': { display: 'none' } }}
        >
          <Typography
            variant="h5"
            fontWeight={400}
            sx={{ color: '#374151', fontSize: { xs: '1.25rem', md: '1.5rem' } }}
          >
            My Availability
          </Typography>
          {/* Right side intentionally left empty to mirror MySchedule layout without extra controls */}
        </Stack>

        {/* Month Navigation (styled like MySchedule); hidden on print */}
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

        {/* Print-only month header centered above calendar for consistency */}
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

        {/* Calendar Grid */}
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
              const isToday = isCurrentMonth && day === today.getDate();
              return (
                <Box
                  key={day}
                  sx={{
                    border: '1px solid',
                    borderColor: isUnavailable
                      ? 'error.light'
                      : isToday
                        ? 'primary.main'
                        : 'divider',
                    borderRadius: 1,
                    p: 1,
                    minHeight: 100,
                    cursor: 'pointer',
                    position: 'relative',
                    bgcolor: isUnavailable
                      ? 'background.paper'
                      : isToday
                        ? 'rgba(31,41,55,0.05)'
                        : 'background.paper',
                    '@media print': {
                      minHeight: 80,
                      bgcolor: 'transparent',
                      borderColor: '#e5e7eb',
                      breakInside: 'avoid',
                    },
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
                  <Typography
                    variant="caption"
                    color={
                      isUnavailable ? 'error.main' : isToday ? 'primary.main' : 'text.secondary'
                    }
                    sx={{ fontWeight: isToday ? 700 : 400 }}
                  >
                    {day}
                  </Typography>
                  {list.map((s) => (
                    <Box
                      key={s._id}
                      sx={{
                        mt: 0.5,
                        p: 0.5,
                        bgcolor: 'action.selected',
                        borderRadius: 0.5,
                      }}
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

        {/* Notes Section */}
        <Card sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: '500' }}>
              Notes & Availability
            </Typography>
            <Chip
              label={`${Object.keys(notes).length} notes`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Stack>

          {Object.keys(notes).length > 0 ? (
            <Stack spacing={2}>
              {Object.entries(notes)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([d, text]) => (
                  <Box
                    key={d}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      },
                    }}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                    >
                      <Box sx={{ minWidth: 120 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: '600', color: 'primary.main' }}
                        >
                          {dayjs(d).format('MMM D, YYYY')}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ flex: 1, color: 'text.primary' }}>
                        {text}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
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
                          variant="outlined"
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
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No notes yet. Click on any date in the calendar to add notes or mark yourself as
                unavailable.
              </Typography>
            </Box>
          )}
        </Card>
      </PageLayout>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={!!menuAnchor}
        onClose={closeDateMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          },
        }}
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

      {/* Note Dialog */}
      <Dialog
        open={noteDialogOpen}
        onClose={() => setNoteDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>{notes[noteDate || ''] ? 'Edit Note' : 'Add Note'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label={noteDate ? dayjs(noteDate).format('MMM D, YYYY') : ''}
            type="text"
            fullWidth
            multiline
            minRows={3}
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setNoteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Note?</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2">
            Are you sure you want to delete the note for{' '}
            {deleteDate ? dayjs(deleteDate).format('MMM D, YYYY') : 'this date'}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
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
    </AppShell>
  );
}
