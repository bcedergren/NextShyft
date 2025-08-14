'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Stack,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';
// Top navigation is now provided by AppShell

type Row = {
  date: string;
  hours: number;
  shifts: { start: string; end: string; positionName?: string }[];
};

export default function MyHoursDetail() {
  const [month, setMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const res = await fetch('/api/my/shifts?month=' + month);
    const items = await res.json();
    const map: Record<string, Row> = {};
    for (const s of items) {
      const d = new Date(s.date).toISOString().slice(0, 10);
      const h = hoursBetween(s.start, s.end);
      map[d] = map[d] || { date: d, hours: 0, shifts: [] };
      map[d].hours += h;
      map[d].shifts.push({ start: s.start, end: s.end, positionName: s.positionName });
    }
    setRows(Object.values(map).sort((a, b) => a.date.localeCompare(b.date)));
  };

  useEffect(() => {
    load();
  }, [month]);

  const total = rows.reduce((a, b) => a + b.hours, 0);
  const monthLabel = useMemo(() => dayjs(month + '-01').format('MMMM YYYY'), [month]);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">My Hours</Typography>
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
          <Button href={'/api/my/hours/export?month=' + month} target="_blank" variant="outlined">
            Export CSV
          </Button>
        </Stack>
        <Paper sx={{ p: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Shifts</TableCell>
                <TableCell align="right">Hours</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.date}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>
                    {r.shifts
                      .map(
                        (s) => `${s.start}-${s.end}${s.positionName ? ' ' + s.positionName : ''}`,
                      )
                      .join(', ')}
                  </TableCell>
                  <TableCell align="right">{r.hours.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={2}>
                  <b>Total</b>
                </TableCell>
                <TableCell align="right">
                  <b>{total.toFixed(2)}</b>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Stack>
      {/* Bottom navigation removed; now using top tabs in AppShell */}
    </AppShell>
  );

  function hoursBetween(start: string, end: string) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh + em / 60 - (sh + sm / 60);
  }
}
