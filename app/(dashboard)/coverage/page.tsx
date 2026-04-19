'use client';

import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CoveragePage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.orgId ?? null;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <DashboardIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Coverage
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            View staffing coverage and analytics
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ color: '#475569', mb: 2 }}>
          View coverage gaps, staffing levels, and real-time analytics to optimize your schedule.
          Use the full Coverage page in your organization for heatmaps, demand by position, and
          schedule generation.
        </Typography>
        {orgId ? (
          <Button
            component={Link}
            href={`/org/${orgId}/coverage`}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Open full Coverage in your organization
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sign in and select an organization to access coverage tools.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
