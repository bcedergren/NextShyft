import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  Typography,
  Stack,
} from '@mui/material';

// Temporarily simplified due to Material-UI v7 compatibility issues
export default function NextShyftLandingMUI() {
  return (
    <Box sx={{ bgcolor: '#fff', color: '#0f172a', minHeight: '100vh' }}>
      {/* Announcement Bar */}
      <Box sx={{ bgcolor: 'linear-gradient(90deg, #4F46E5, #D946EF)', color: '#fff' }}>
        <Container maxWidth="lg">
          <Box sx={{ py: 1, textAlign: 'center', fontSize: 14 }}>
            <strong>New:</strong> AI auto‑fill now balances skills, availability & labor laws.
          </Box>
        </Container>
      </Box>

      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          color: 'inherit',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: 'linear-gradient(135deg,#4F46E5,#D946EF)',
              }}
            />
            <Typography variant="h6" fontWeight={800}>
              NextShyft
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button href="/signin" color="inherit">
              Sign in
            </Button>
            <Button
              href="#cta"
              variant="contained"
              sx={{ bgcolor: '#0f172a', ':hover': { bgcolor: '#111827' }, borderRadius: 2 }}
            >
              Get started
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Simple Content */}
      <Container maxWidth="lg" sx={{ pt: 8, pb: 6 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h2" fontWeight={900} sx={{ mb: 3 }}>
            Plan coverage in minutes, not hours.
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            NextShyft turns availability into optimized schedules that balance skills, labor
            rules, and cost—then keeps everyone in sync with instant updates.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              href="#cta"
              variant="contained"
              sx={{
                bgcolor: '#4F46E5',
                ':hover': { bgcolor: '#4338CA' },
                borderRadius: 2,
                px: 3,
                py: 1.25,
              }}
            >
              Start free trial
            </Button>
            <Button
              href="#demo"
              variant="outlined"
              sx={{ borderColor: '#e2e8f0', borderRadius: 2, px: 3, py: 1.25 }}
            >
              Watch 90s demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
