'use client';
import { Box, Stack, Typography } from '@mui/material';
import ScheduleIcon from '@mui/icons-material/Schedule';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SecurityIcon from '@mui/icons-material/Security';

export default function FeaturesSection() {
  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h3" textAlign="center" fontWeight="bold">
          Everything you need to manage your team
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" maxWidth={600}>
          Comprehensive tools designed for modern businesses that need reliable, efficient
          scheduling
        </Typography>
      </Stack>

      <Stack direction="row" spacing={4} sx={{ mt: 6, flexWrap: 'wrap' }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' } }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <ScheduleIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5">Smart Scheduling</Typography>
            </Stack>
            <Typography color="text.secondary">
              AI-powered scheduling that considers availability, skills, and business rules to
              create optimal coverage.
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' } }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <NotificationsIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5">Real-time Notifications</Typography>
            </Stack>
            <Typography color="text.secondary">
              Instant updates via email, SMS, and push notifications to keep everyone informed.
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' } }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <AnalyticsIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5">Advanced Analytics</Typography>
            </Stack>
            <Typography color="text.secondary">
              Track performance, identify patterns, and optimize your scheduling strategy with
              detailed insights.
            </Typography>
          </Stack>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 16px)' } }}>
          <Stack spacing={3}>
            <Stack direction="row" spacing={2} alignItems="center">
              <SecurityIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h5">Enterprise Security</Typography>
            </Stack>
            <Typography color="text.secondary">
              Bank-level security with role-based access control and comprehensive audit trails.
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
