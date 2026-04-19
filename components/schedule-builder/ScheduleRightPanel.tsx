'use client';

import { Box, Button, List, ListItem, ListItemText, Tab, Tabs, Typography } from '@mui/material';
import { useState } from 'react';

const INK = '#0F1B2D';
const MUTED = '#5B677A';
const BORDER = 'rgba(15, 27, 45, 0.10)';

interface OpenShiftItem {
  id: string;
  day: string;
  role: string;
  timeRange: string;
}

interface WarningItem {
  id: string;
  message: string;
  shiftRef?: string;
}

interface RequestItem {
  id: string;
  employeeName: string;
  requestType: string;
  impact?: string;
}

const MOCK_OPEN_SHIFTS: OpenShiftItem[] = [
  { id: '1', day: 'Tue 28', role: 'Server', timeRange: '5:00 PM – 10:00 PM' },
  { id: '2', day: 'Thu 30', role: 'Bartender', timeRange: '4:00 PM – 11:00 PM' },
];

const MOCK_WARNINGS: WarningItem[] = [
  { id: '1', message: 'Alex Chen may hit overtime by Friday', shiftRef: 'Dinner Server' },
  { id: '2', message: 'Jordan has availability conflict on Wed 29', shiftRef: 'Lunch Host' },
];

const MOCK_REQUESTS: RequestItem[] = [
  { id: '1', employeeName: 'Sam Lee', requestType: 'Time off Sat 1', impact: '1 Server short' },
  { id: '2', employeeName: 'Morgan', requestType: 'Swap Thu 30', impact: 'No coverage impact' },
];

export default function ScheduleRightPanel() {
  const [tab, setTab] = useState(0);

  return (
    <Box
      sx={{
        width: { xs: '100%', md: 320 },
        flexShrink: 0,
        borderLeft: { md: `1px solid ${BORDER}` },
        bgcolor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: `1px solid ${BORDER}`,
          minHeight: 44,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', color: MUTED },
          '& .Mui-selected': { color: INK },
        }}
      >
        <Tab label="Open Shifts" />
        <Tab label="Warnings" />
        <Tab label="Requests" />
      </Tabs>
      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {tab === 0 && (
          <List dense disablePadding>
            {MOCK_OPEN_SHIFTS.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 2,
                  mb: 1,
                  py: 1.25,
                  px: 1.5,
                }}
              >
                <ListItemText
                  primary={`${item.role} · ${item.day}`}
                  secondary={item.timeRange}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem', color: INK }}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: MUTED }}
                />
                <Button
                  size="small"
                  variant="contained"
                  sx={{
                    mt: 1,
                    bgcolor: INK,
                    color: '#fff',
                    borderRadius: 2,
                    minHeight: 32,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: '#0a1320' },
                  }}
                >
                  Offer
                </Button>
              </ListItem>
            ))}
          </List>
        )}
        {tab === 1 && (
          <List dense disablePadding>
            {MOCK_WARNINGS.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 2,
                  mb: 1,
                  py: 1.25,
                  px: 1.5,
                }}
              >
                <ListItemText
                  primary={item.message}
                  secondary={item.shiftRef}
                  primaryTypographyProps={{ fontSize: '0.8125rem', color: INK }}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: MUTED }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 1,
                    borderColor: BORDER,
                    color: INK,
                    borderRadius: 2,
                    minHeight: 32,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    '&:hover': { borderColor: 'rgba(15,27,45,0.25)', bgcolor: 'rgba(247,248,251,0.8)' },
                  }}
                >
                  Fix
                </Button>
              </ListItem>
            ))}
          </List>
        )}
        {tab === 2 && (
          <List dense disablePadding>
            {MOCK_REQUESTS.map((item) => (
              <ListItem
                key={item.id}
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  border: `1px solid ${BORDER}`,
                  borderRadius: 2,
                  mb: 1,
                  py: 1.25,
                  px: 1.5,
                }}
              >
                <ListItemText
                  primary={`${item.employeeName}: ${item.requestType}`}
                  secondary={item.impact}
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem', color: INK }}
                  secondaryTypographyProps={{ fontSize: '0.75rem', color: MUTED }}
                />
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      flex: 1,
                      bgcolor: INK,
                      color: '#fff',
                      borderRadius: 2,
                      minHeight: 32,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      '&:hover': { bgcolor: '#0a1320' },
                    }}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      flex: 1,
                      borderColor: BORDER,
                      color: INK,
                      borderRadius: 2,
                      minHeight: 32,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      '&:hover': { borderColor: 'rgba(15,27,45,0.25)', bgcolor: 'rgba(247,248,251,0.8)' },
                    }}
                  >
                    Deny
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
}
