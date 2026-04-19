'use client';

import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ScheduleIcon from '@mui/icons-material/Schedule';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import { useState } from 'react';

const INK = '#0F1B2D';
const MUTED = '#5B677A';
const BORDER = 'rgba(15, 27, 45, 0.10)';

export type WarningType = 'overtime' | 'availability' | 'break';

interface ShiftCardProps {
  employeeName: string;
  role: string;
  timeRange: string;
  roleColor?: string;
  warnings?: WarningType[];
  /** For future drag-and-drop */
  dataShiftId?: string;
}

const WARNING_ICONS: Record<WarningType, React.ReactNode> = {
  overtime: <ScheduleIcon sx={{ fontSize: 14, color: MUTED }} />,
  availability: <WarningAmberIcon sx={{ fontSize: 14, color: MUTED }} />,
  break: <FreeBreakfastIcon sx={{ fontSize: 14, color: MUTED }} />,
};

export default function ShiftCard({
  employeeName,
  role,
  timeRange,
  roleColor = 'rgba(15, 27, 45, 0.06)',
  warnings = [],
  dataShiftId,
}: ShiftCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box
      data-shift-id={dataShiftId}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: `1px solid ${BORDER}`,
        bgcolor: '#FFFFFF',
        cursor: 'default',
        '&:hover': { boxShadow: '0 2px 8px rgba(15,27,45,0.08)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" fontWeight="600" sx={{ color: INK }} noWrap>
            {employeeName}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              display: 'inline-block',
              mt: 0.25,
              px: 0.75,
              py: 0.25,
              borderRadius: 1,
              bgcolor: roleColor,
              color: MUTED,
              fontWeight: 500,
            }}
          >
            {role}
          </Typography>
          <Typography variant="caption" display="block" sx={{ color: MUTED, mt: 0.5 }}>
            {timeRange}
          </Typography>
          {warnings.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75 }} aria-hidden>
              {warnings.map((w) => (
                <span key={w} title={w}>{WARNING_ICONS[w]}</span>
              ))}
            </Box>
          )}
        </Box>
        <IconButton
          size="small"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
          sx={{ color: MUTED, p: 0.25 }}
          aria-label="Shift actions"
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => setMenuAnchor(null)}>Edit</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}>Remove</MenuItem>
      </Menu>
    </Box>
  );
}
