'use client';
import { Box, Typography, Tooltip } from '@mui/material';
import { Fragment } from 'react';

type HeatCell = { count: number };
type HeatData = Record<string, HeatCell[]>; // day -> 24 cells

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function CoverageHeatmap({ data }: { data?: HeatData }) {
  const grid =
    data ||
    Object.fromEntries(
      days.map((d) => [
        d,
        Array.from({ length: 24 }, (_, h) => ({
          count: d === 'Fri' && h >= 17 && h <= 22 ? (h % 3) + 1 : 0,
        })),
      ]),
    );
  const max = Math.max(
    ...Object.values(grid)
      .flat()
      .map((c) => c.count),
    1,
  );
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: `100px repeat(24, 1fr)`, gap: 0.5 }}>
        <Box />
        {Array.from({ length: 24 }, (_, h) => (
          <Box key={h} sx={{ fontSize: 12, textAlign: 'center' }}>
            {h}
          </Box>
        ))}
        {days.map((day) => (
          <Fragment key={day}>
            <Box sx={{ fontSize: 12, textAlign: 'right', pr: 1 }}>{day}</Box>
            {grid[day].map((c, i) => (
              <Tooltip
                key={`${day}-${i}`}
                title={`${day} ${i}:00 — ${c.count}`}
                followCursor
                enterDelay={0}
                enterNextDelay={0}
                placement="top"
                disableFocusListener
                disableTouchListener
              >
                <Box
                  sx={{
                    height: 18,
                    bgcolor: `rgba(108,99,255,${c.count / max})`,
                    borderRadius: 0.5,
                  }}
                />
              </Tooltip>
            ))}
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}
