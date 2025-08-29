'use client';
import { Box, Paper, Stack, Typography } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import BoltIcon from '@mui/icons-material/Bolt';

export default function QuickFeatures() {
  return (
    <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={1.5}>
            <AccessTimeIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">Fast scheduling</Typography>
            <Typography color="text.secondary">
              Build and publish a schedule in minutes with intelligent coverage assistance.
            </Typography>
          </Stack>
        </Paper>
      </Box>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={1.5}>
            <GroupIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">Team communication</Typography>
            <Typography color="text.secondary">
              Keep staff up to date with announcements, notifications, and swap requests.
            </Typography>
          </Stack>
        </Paper>
      </Box>
      <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
        <Paper sx={{ p: 3, height: '100%' }}>
          <Stack spacing={1.5}>
            <BoltIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6">Automated workflows</Typography>
            <Typography color="text.secondary">
              Let automation handle recurring tasks like publishing and reminders.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}
