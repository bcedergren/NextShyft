'use client';

import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import {
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Skeleton,
  Box,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import DeleteIcon from '@mui/icons-material/Delete';

type Holiday = { _id: string; date: string; name: string; type?: string };

export default function HolidaysPage() {
  const [items, setItems] = useState<Holiday[]>([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('PAID');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/org/policy/holidays');
      const d = await r.json();
      setItems(Array.isArray(d) ? d : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name || !date) return;
    const res = await fetch('/api/org/policy/holidays', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date, type }),
    });
    const list = await res.json();
    setItems(Array.isArray(list) ? list : []);
    setName('');
    setDate('');
    setType('PAID');
  };

  const remove = async (id: string, name: string, date: string) => {
    const res = await fetch(
      `/api/org/policy/holidays?name=${encodeURIComponent(name)}&date=${encodeURIComponent(date)}`,
      { method: 'DELETE' },
    );
    const list = await res.json();
    setItems(Array.isArray(list) ? list : []);
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Holidays</Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr', md: '2fr 1fr 1fr auto' },
            gap: 2,
          }}
        >
          <TextField label="Holiday name" value={name} onChange={(e) => setName(e.target.value)} />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={date ? dayjs(date) : null}
              onChange={(v) => setDate(v ? dayjs(v).format('YYYY-MM-DD') : '')}
              slotProps={{ textField: { InputLabelProps: { shrink: true } } }}
            />
          </LocalizationProvider>
          <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)}>
            {['PAID', 'UNPAID', 'OBSERVED'].map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="contained" onClick={add} disabled={!name || !date}>
            Add
          </Button>
        </Paper>

        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={32} />
              <Skeleton variant="rectangular" height={32} />
              <Skeleton variant="rectangular" height={32} />
            </Stack>
          ) : items.length === 0 ? (
            <Typography color="text.secondary">No holidays yet.</Typography>
          ) : (
            items.map((h: any) => (
              <Stack
                key={h._id}
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <Typography sx={{ flex: 1 }}>{h.name}</Typography>
                <Typography sx={{ width: { xs: '100%', sm: 180 } }}>{h.date}</Typography>
                <Typography sx={{ width: { xs: '100%', sm: 140 } }}>{h.type || 'PAID'}</Typography>
                <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => remove(h._id, h.name, h.date)}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                  >
                    Delete
                  </Button>
                  <IconButton
                    color="error"
                    onClick={() => remove(h._id, h.name, h.date)}
                    sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Stack>
            ))
          )}
        </Paper>
      </Stack>
    </AppShell>
  );
}
