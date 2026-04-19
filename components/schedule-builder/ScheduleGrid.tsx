'use client';

import { Box, Typography } from '@mui/material';
import ShiftCard, { WarningType } from './ShiftCard';

const INK = '#0F1B2D';
const MUTED = '#5B677A';
const BORDER = 'rgba(15, 27, 45, 0.10)';

export type DayPart = 'Lunch' | 'Dinner' | 'Late';
export type Role = 'Server' | 'Bartender' | 'Host' | 'Kitchen';

export interface DayHeader {
  dayName: string;
  date: string;
  staffingSummary?: string;
  underCovered?: boolean;
}

export interface ShiftInCell {
  id: string;
  employeeName: string;
  role: Role;
  timeRange: string;
  warnings?: WarningType[];
}

export interface ScheduleGridProps {
  weekLabel: string;
  dayHeaders: DayHeader[];
  /** dayIndex -> daypart -> role -> shifts[] */
  shiftsByDay: Record<number, Record<string, Record<string, ShiftInCell[]>>>;
  dayparts: DayPart[];
  roles: Role[];
}

const DAYPART_ROLE_ORDER: { daypart: DayPart; role: Role }[] = [
  { daypart: 'Lunch', role: 'Server' },
  { daypart: 'Lunch', role: 'Bartender' },
  { daypart: 'Lunch', role: 'Host' },
  { daypart: 'Lunch', role: 'Kitchen' },
  { daypart: 'Dinner', role: 'Server' },
  { daypart: 'Dinner', role: 'Bartender' },
  { daypart: 'Dinner', role: 'Host' },
  { daypart: 'Dinner', role: 'Kitchen' },
  { daypart: 'Late', role: 'Server' },
  { daypart: 'Late', role: 'Bartender' },
  { daypart: 'Late', role: 'Host' },
  { daypart: 'Late', role: 'Kitchen' },
];

const ROLE_BG: Record<Role, string> = {
  Server: 'rgba(47,174,158,0.08)',
  Bartender: 'rgba(15,27,45,0.06)',
  Host: 'rgba(15,27,45,0.05)',
  Kitchen: 'rgba(15,27,45,0.06)',
};

export default function ScheduleGrid({
  dayHeaders,
  shiftsByDay,
  dayparts,
  roles,
}: ScheduleGridProps) {
  const rowKeys = DAYPART_ROLE_ORDER.filter(
    (r) => dayparts.includes(r.daypart) && roles.includes(r.role),
  );

  const numCols = 1 + dayHeaders.length;
  const headerRow = [
    <Box key="corner" sx={{ p: 1.5, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, bgcolor: 'rgba(15,27,45,0.03)' }} />,
    ...dayHeaders.map((d, i) => (
      <Box
        key={`day-${i}`}
        sx={{
          p: 1.5,
          borderRight: i < dayHeaders.length - 1 ? `1px solid ${BORDER}` : 'none',
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: d.underCovered ? 'rgba(237,108,2,0.06)' : 'rgba(15,27,45,0.03)',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" fontWeight="700" sx={{ color: INK }}>
          {d.dayName} {d.date}
        </Typography>
        {d.staffingSummary && (
          <Typography variant="caption" display="block" sx={{ color: MUTED, mt: 0.25 }}>
            {d.staffingSummary}
          </Typography>
        )}
      </Box>
    )),
  ];

  const dataRows = rowKeys.map(({ daypart, role }, rowIdx) => [
    <Box
      key={`label-${rowIdx}`}
      sx={{
        p: 1,
        borderRight: `1px solid ${BORDER}`,
        borderBottom: rowIdx < rowKeys.length - 1 ? `1px solid ${BORDER}` : 'none',
        bgcolor: 'rgba(15,27,45,0.02)',
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.75rem',
        color: MUTED,
        fontWeight: 500,
      }}
    >
      {daypart} · {role}
    </Box>,
    ...dayHeaders.map((_, dayIdx) => {
      const dayShifts = shiftsByDay[dayIdx]?.[daypart]?.[role] ?? [];
      return (
        <Box
          key={`${rowIdx}-${dayIdx}`}
          sx={{
            p: 1,
            borderRight: dayIdx < dayHeaders.length - 1 ? `1px solid ${BORDER}` : 'none',
            borderBottom: rowIdx < rowKeys.length - 1 ? `1px solid ${BORDER}` : 'none',
            minHeight: 56,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          {dayShifts.length === 0 ? (
            <Box sx={{ height: 48, borderRadius: 1, border: `1px dashed ${BORDER}`, bgcolor: 'rgba(15,27,45,0.02)' }} />
          ) : (
            dayShifts.map((s) => (
              <ShiftCard
                key={s.id}
                dataShiftId={s.id}
                employeeName={s.employeeName}
                role={s.role}
                timeRange={s.timeRange}
                roleColor={ROLE_BG[s.role]}
                warnings={s.warnings}
              />
            ))
          )}
        </Box>
      );
    }),
  ]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `120px repeat(${dayHeaders.length}, minmax(140px, 1fr))`,
        gap: 0,
        border: `1px solid ${BORDER}`,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
      }}
    >
      {headerRow}
      {dataRows.flat()}
    </Box>
  );
}
