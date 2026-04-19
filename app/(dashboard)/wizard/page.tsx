'use client';

import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function WizardPage() {
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
            bgcolor: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AutoFixHighIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Setup Wizard
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Guided setup for your organization
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ color: '#475569', mb: 2 }}>
          Get step-by-step guidance to configure your organization, positions, and schedules
          quickly. Use the full Setup Wizard in your organization to create schedules, run the
          solver, and publish.
        </Typography>
        {orgId ? (
          <Button
            component={Link}
            href={`/org/${orgId}/wizard`}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Open Setup Wizard in your organization
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Sign in and select an organization to access the setup wizard.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
