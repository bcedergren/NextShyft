'use client';
import { useEffect, useRef, useState, Fragment } from 'react';
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';

// Align day ordering with the API (/api/demand) which uses ['sun','mon',...]
const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export default function CoverageEditor() {
  const [positions, setPositions] = useState<any[]>([]);
  const [posId, setPosId] = useState<string>('');
  const [grid, setGrid] = useState<number[][]>(Array.from({ length: 7 }, () => Array(24).fill(0)));
  const dragging = useRef<{ val: number } | null>(null);

  useEffect(() => {
    fetch('/api/positions')
      .then((r) => r.json())
      .then((ps) => {
        setPositions(ps);
        if (ps[0]) setPosId(ps[0]._id);
      });
  }, []);

  useEffect(() => {
    if (!posId) return;
    fetch('/api/demand?positionId=' + posId)
      .then((r) => r.json())
      .then((d) => {
        setGrid(d.grid || Array.from({ length: 7 }, () => Array(24).fill(0)));
      });
  }, [posId]);

  const setCell = (d: number, h: number, val: number) => {
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[d][h] = val;
      return next;
    });
  };

  const onMouseDown = (d: number, h: number) => {
    dragging.current = { val: grid[d][h] === 0 ? 1 : 0 };
    setCell(d, h, dragging.current.val);
  };
  const onMouseEnter = (d: number, h: number) => {
    if (!dragging.current) return;
    setCell(d, h, dragging.current.val);
  };
  const onMouseUp = () => (dragging.current = null);

  const save = async () => {
    await fetch('/api/demand', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ positionId: posId, grid }),
    });
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Coverage Demand Editor</Typography>
      <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          select
          label="Position"
          value={posId}
          onChange={(e) => setPosId(e.target.value)}
          sx={{ minWidth: 220 }}
        >
          {positions.map((p) => (
            <MenuItem key={p._id} value={p._id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <Button onClick={save} variant="contained">
          Save Coverage
        </Button>
      </Paper>
      <Box sx={{ overflowX: 'auto' }} onMouseLeave={onMouseUp}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '100px repeat(24, 28px)',
            gap: 0.5,
            userSelect: 'none',
          }}
        >
          <Box />
          {Array.from({ length: 24 }, (_, h) => (
            <Box key={h} sx={{ fontSize: 12, textAlign: 'center' }}>
              {h}
            </Box>
          ))}
          {days.map((dName, dIdx) => (
            <Fragment key={dName}>
              <Box sx={{ fontSize: 12, textAlign: 'right', pr: 1 }}>{dName.toUpperCase()}</Box>
              {Array.from({ length: 24 }, (_, h) => (
                <Box
                  key={dName + h}
                  onMouseDown={() => onMouseDown(dIdx, h)}
                  onMouseEnter={() => onMouseEnter(dIdx, h)}
                  onMouseUp={onMouseUp}
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 0.5,
                    bgcolor: grid[dIdx][h] ? 'primary.main' : 'action.hover',
                    cursor: 'crosshair',
                  }}
                />
              ))}
            </Fragment>
          ))}
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary">
        Tip: Click and drag to toggle multiple cells. Saving coverage does not modify existing shift
        templates.
      </Typography>
    </Stack>
  );
}
