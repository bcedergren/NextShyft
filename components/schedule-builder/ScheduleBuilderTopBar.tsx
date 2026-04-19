'use client';

import {
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AddIcon from '@mui/icons-material/Add';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { useState } from 'react';

const INK = '#0F1B2D';
const BORDER = 'rgba(15, 27, 45, 0.10)';
const SHADOW = '0 12px 30px rgba(15, 27, 45, 0.10)';

type StatusKind = 'draft' | 'published' | 'modified';

const LOCATIONS = ['Downtown', 'Airport', 'Mall'];
const STATUS_LABELS: Record<StatusKind, string> = {
  draft: 'Draft',
  published: 'Published',
  modified: 'Modified after publish',
};

interface ScheduleBuilderTopBarProps {
  weekLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  status: StatusKind;
  location?: string;
  onLocationChange?: (loc: string) => void;
}

export default function ScheduleBuilderTopBar({
  weekLabel,
  onPrevWeek,
  onNextWeek,
  status,
  location = LOCATIONS[0],
  onLocationChange,
}: ScheduleBuilderTopBarProps) {
  const [templatesAnchor, setTemplatesAnchor] = useState<null | HTMLElement>(null);

  const handleLocationChange = (e: SelectChangeEvent<string>) => {
    onLocationChange?.(e.target.value);
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: '#FFFFFF',
        borderBottom: `1px solid ${BORDER}`,
        boxShadow: '0 1px 3px rgba(15,27,45,0.06)',
        px: 2,
        py: 1.5,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        flexWrap="wrap"
      >
        <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={location}
              onChange={handleLocationChange}
              displayEmpty
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: INK,
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: BORDER },
              }}
            >
              {LOCATIONS.map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton size="small" onClick={onPrevWeek} aria-label="Previous week" sx={{ color: INK }}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="body2" fontWeight="600" sx={{ minWidth: 140, textAlign: 'center', color: INK }}>
              {weekLabel}
            </Typography>
            <IconButton size="small" onClick={onNextWeek} aria-label="Next week" sx={{ color: INK }}>
              <ChevronRightIcon />
            </IconButton>
          </Stack>
          <Chip
            size="small"
            label={STATUS_LABELS[status]}
            sx={{
              bgcolor: status === 'draft' ? 'rgba(15,27,45,0.08)' : status === 'modified' ? 'rgba(237,108,2,0.12)' : 'rgba(47,174,158,0.12)',
              color: status === 'draft' ? INK : status === 'modified' ? '#ED6C02' : '#2FAE9E',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            sx={{
              borderColor: BORDER,
              color: INK,
              borderRadius: 2,
              minHeight: 40,
              fontWeight: 500,
              '&:hover': { borderColor: 'rgba(15,27,45,0.25)', bgcolor: 'rgba(247,248,251,0.8)' },
            }}
          >
            Add Shift
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewModuleIcon />}
            onClick={(e) => setTemplatesAnchor(e.currentTarget)}
            sx={{
              borderColor: BORDER,
              color: INK,
              borderRadius: 2,
              minHeight: 40,
              fontWeight: 500,
              '&:hover': { borderColor: 'rgba(15,27,45,0.25)', bgcolor: 'rgba(247,248,251,0.8)' },
            }}
          >
            Templates
          </Button>
          <Menu
            anchorEl={templatesAnchor}
            open={Boolean(templatesAnchor)}
            onClose={() => setTemplatesAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => setTemplatesAnchor(null)}>Week template A</MenuItem>
            <MenuItem onClick={() => setTemplatesAnchor(null)}>Week template B</MenuItem>
          </Menu>
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: INK,
              color: '#fff',
              boxShadow: SHADOW,
              borderRadius: 2,
              minHeight: 40,
              px: 2.5,
              fontWeight: 600,
              '&:hover': { bgcolor: '#0a1320', boxShadow: '0 12px 30px rgba(15, 27, 45, 0.14)' },
            }}
          >
            Publish Schedule
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
