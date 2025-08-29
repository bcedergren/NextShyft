'use client';
import Link from 'next/link';
import { Box, Paper, Stack, Typography, Button } from '@mui/material';

export default function CTASection() {
  return (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <Paper
        sx={{
          p: 6,
          background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
          color: 'white',
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            Ready to transform your scheduling?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Join thousands of teams already using NextShyft to streamline their operations.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            <Link href="/signup">
              <Button
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5, bgcolor: 'white', color: 'primary.main' }}
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/demo">
              <Button
                variant="outlined"
                size="large"
                sx={{ px: 4, py: 1.5, borderColor: 'white', color: 'white' }}
              >
                Schedule Demo
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
