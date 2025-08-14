'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';

export type CalendarItem = {
  id: string;
  day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  start: string; // HH:mm
  end: string; // HH:mm (may be earlier than start for overnight)
  title: string;
};

const DAYS: { value: CalendarItem['day']; label: string }[] = [
  { value: 'mon', label: 'Monday' },
  { value: 'tue', label: 'Tuesday' },
  { value: 'wed', label: 'Wednesday' },
  { value: 'thu', label: 'Thursday' },
  { value: 'fri', label: 'Friday' },
  { value: 'sat', label: 'Saturday' },
  { value: 'sun', label: 'Sunday' },
];

export default function CalendarGrid({ items }: { items: CalendarItem[] }) {
  const itemsByDay: Record<CalendarItem['day'], CalendarItem[]> = {
    mon: [],
    tue: [],
    wed: [],
    thu: [],
    fri: [],
    sat: [],
    sun: [],
  };
  for (const it of items) itemsByDay[it.day].push(it);
  for (const d of Object.keys(itemsByDay) as CalendarItem['day'][]) {
    itemsByDay[d].sort((a, b) => a.start.localeCompare(b.start));
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems="stretch"
        sx={{ overflowX: { xs: 'auto', md: 'visible' } }}
      >
        {DAYS.map((d) => (
          <Box key={d.value} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {d.label}
            </Typography>
            <Stack spacing={1}>
              {itemsByDay[d.value].length === 0 && (
                <Typography color="text.secondary" variant="caption">
                  No items
                </Typography>
              )}
              {itemsByDay[d.value].map((it) => {
                const overnight = it.start > it.end;
                return (
                  <Box
                    key={it.id}
                    sx={{
                      p: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="body2">{it.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {it.start}–{it.end}
                      {overnight ? ' (next day)' : ''}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
}
