'use client';
import AvailabilityQuick from '@/components/AvailabilityQuick';
import { useEffect, useState } from 'react';
import { Box, Button, Chip, Stack, Typography } from '@mui/material';

type Block = { start: string; end: string; prefer?: boolean };
type Week = Record<string, Block[]>;
type DateMap = Record<string, Block[]>; // 'YYYY-MM-DD' -> blocks

const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const labels: Record<string, string> = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};
const defaultBlocks: Block[] = [{ start: '09:00', end: '17:00' }];

export default function AvailabilityGrid() {
  const [weekly, setWeekly] = useState<Week>({});
  const [dates, setDates] = useState<DateMap>({});

  useEffect(() => {
    fetch('/api/availability')
      .then((r) => r.json())
      .then((d) => {
        setWeekly(d.weekly || Object.fromEntries(days.map((d: string) => [d, defaultBlocks])));
        setDates(d.dates || {});
      });
  }, []);

  const addBlock = (day: string) => {
    const next = { ...weekly };
    next[day] = [...(next[day] || []), { start: '10:00', end: '14:00' }];
    setWeekly(next);
  };

  const removeBlock = (day: string, idx: number) => {
    const next = { ...weekly };
    next[day] = (next[day] || []).filter((_, i) => i !== idx);
    setWeekly(next);
  };

  const updateBlock = (day: string, idx: number, field: 'start' | 'end', value: string) => {
    const next = { ...weekly };
    const arr = [...(next[day] || [])];
    arr[idx] = { ...arr[idx], [field]: value };
    next[day] = arr;
    setWeekly(next);
  };

  const save = async () => {
    await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekly, dates }),
    });
  };

  return (
    <Stack spacing={2}>
      <AvailabilityQuick
        onCopy={() => {
          setWeekly((prev) => {
            const next: any = { ...prev };
            const mon = next['mon'] || [];
            for (const d of ['tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
              next[d] = mon.map((b: any) => ({ ...b }));
            return next;
          });
        }}
        onClear={() => {
          setWeekly(Object.fromEntries(days.map((d) => [d, []])) as any);
        }}
      />

      <Typography variant="h6">My Availability</Typography>
      <Stack spacing={1}>
        {days.map((day) => (
          <Box
            key={day}
            sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography sx={{ width: 60 }}>{labels[day]}</Typography>
              <Button size="small" onClick={() => addBlock(day)}>
                Add
              </Button>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {(weekly[day] || []).map((b, i) => (
                <Chip
                  key={i}
                  label={`${b.start}–${b.end}`}
                  onDelete={() => removeBlock(day, i)}
                  clickable
                  onClick={() => {
                    const start = prompt('Start (HH:mm)', b.start) || b.start;
                    const end = prompt('End (HH:mm)', b.end) || b.end;
                    updateBlock(day, i, 'start', start);
                    updateBlock(day, i, 'end', end);
                  }}
                />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>

      <Typography variant="subtitle1">Per-date exceptions</Typography>
      <Stack spacing={1}>
        <Box sx={{ p: 1, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography sx={{ width: 120 }}>Add date</Typography>
            <input
              type="date"
              onChange={(e) => {
                const key = e.target.value;
                if (!key) return;
                setDates((prev) => ({
                  ...prev,
                  [key]: prev[key] || [{ start: '10:00', end: '16:00' }],
                }));
              }}
            />
          </Stack>
          <Stack spacing={1}>
            {Object.keys(dates)
              .sort()
              .map((d) => (
                <Box
                  key={d}
                  sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography sx={{ width: 120 }}>{d}</Typography>
                    <Button
                      size="small"
                      onClick={() =>
                        setDates((prev) => {
                          const n = { ...prev };
                          n[d] = [...(n[d] || []), { start: '10:00', end: '16:00' }];
                          return n;
                        })
                      }
                    >
                      Add
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        setDates((prev) => {
                          const n = { ...prev };
                          delete n[d];
                          return n;
                        })
                      }
                    >
                      Remove date
                    </Button>
                  </Stack>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {(dates[d] || []).map((b, i) => (
                      <Chip
                        key={i}
                        label={`${b.start}–${b.end}`}
                        onDelete={() =>
                          setDates((prev) => {
                            const n: any = { ...prev };
                            n[d] = (n[d] || []).filter((_: any, idx: number) => idx !== i);
                            return n;
                          })
                        }
                        clickable
                        onClick={() => {
                          const start = prompt('Start (HH:mm)', b.start) || b.start;
                          const end = prompt('End (HH:mm)', b.end) || b.end;
                          setDates((prev) => {
                            const n: any = { ...prev };
                            const arr = [...(n[d] || [])];
                            arr[i] = { ...arr[i], start, end };
                            n[d] = arr;
                            return n;
                          });
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
          </Stack>
        </Box>
      </Stack>
      <Box>
        <Button variant="contained" onClick={save}>
          Save Availability
        </Button>
      </Box>
    </Stack>
  );
}
