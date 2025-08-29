'use client';
import Footer from '@/components/Footer';
import { PageHeader, PageLayout } from '@/components/page';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import Link from 'next/link';

export default function Page() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff' }}>
      {/* Minimal Header */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 2, md: 4 }}>
        <PageHeader
          title="NextShyft"
          actions={
            <Stack direction="row" spacing={3}>
              <Button href="/signin" color="inherit" sx={{ fontWeight: 400 }}>
                Sign in
              </Button>
              <Button
                href="/signup"
                variant="contained"
                sx={{
                  bgcolor: '#1f2937',
                  '&:hover': { bgcolor: '#111827' },
                  fontWeight: 500,
                  px: 3,
                }}
              >
                Get Started
              </Button>
            </Stack>
          }
          variant="compact"
        />
      </PageLayout>

      {/* Hero Section */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 4, md: 8 }}>
        <Typography
          variant="h1"
          fontWeight="200"
          sx={{
            fontSize: { xs: '2.5rem', md: '4rem' },
            lineHeight: 1.1,
            mb: 2,
            color: '#1f2937',
          }}
        >
          Smarter shift scheduling
          <br />
          <span style={{ fontWeight: 400 }}>for modern teams</span>
        </Typography>

        <Typography
          variant="h5"
          color="#6b7280"
          fontWeight="300"
          sx={{
            mb: 3,
            maxWidth: '600px',
            mx: 'auto',
            lineHeight: 1.6,
          }}
        >
          Plan coverage in minutes, not hours. Keep your team informed and your floor covered with
          intelligent scheduling.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Button
            href="/signup"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#1f2937',
              '&:hover': { bgcolor: '#111827' },
              px: 5,
              py: 1.5,
              fontWeight: 500,
              fontSize: '1.1rem',
            }}
          >
            Start Free Trial
          </Button>
          <Button
            href="/demo"
            variant="outlined"
            size="large"
            sx={{
              borderColor: '#d1d5db',
              color: '#374151',
              px: 5,
              py: 1.5,
              fontWeight: 500,
              fontSize: '1.1rem',
              '&:hover': {
                borderColor: '#9ca3af',
                bgcolor: '#f9fafb',
              },
            }}
          >
            View Demo
          </Button>
        </Stack>

        {/* Simple Trust Indicators */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ color: '#9ca3af' }}>
          <Typography variant="body2" fontWeight="400">
            ✓ No credit card required
          </Typography>
          <Typography variant="body2" fontWeight="400">
            ✓ Free forever plan
          </Typography>
          <Typography variant="body2" fontWeight="400">
            ✓ Setup in 5 minutes
          </Typography>
        </Stack>
      </PageLayout>

      {/* Simple Divider */}
      <Box sx={{ borderTop: '1px solid #f3f4f6' }} />

      {/* Features Section */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 4, md: 8 }}>
        <PageHeader title="Everything you need to schedule with confidence" variant="compact" />

        <Stack spacing={3}>
          {/* Feature 1 */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="400" sx={{ mb: 3, color: '#1f2937' }}>
                AI-powered scheduling
              </Typography>
              <Typography variant="h6" color="#6b7280" fontWeight="300" sx={{ lineHeight: 1.7 }}>
                Our AI learns from your preferences and automatically fills schedules, balancing
                skills, seniority, and availability. Review and adjust before publishing.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <Typography variant="h2" color="#9ca3af" fontWeight="200">
                  AI
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Feature 2 */}
          <Stack direction={{ xs: 'column', md: 'row-reverse' }} spacing={3} alignItems="center">
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="400" sx={{ mb: 3, color: '#1f2937' }}>
                Team availability portal
              </Typography>
              <Typography variant="h6" color="#6b7280" fontWeight="300" sx={{ lineHeight: 1.7 }}>
                Staff enter their availability and PTO through a simple mobile-friendly interface.
                No more back-and-forth emails or missed requests.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <Typography variant="h2" color="#9ca3af" fontWeight="200">
                  📱
                </Typography>
              </Box>
            </Box>
          </Stack>

          {/* Feature 3 */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
            <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
              <Typography variant="h3" fontWeight="400" sx={{ mb: 3, color: '#1f2937' }}>
                Instant notifications
              </Typography>
              <Typography variant="h6" color="#6b7280" fontWeight="300" sx={{ lineHeight: 1.7 }}>
                Keep everyone in sync with SMS, email, and push notifications. Shift changes,
                approvals, and updates are delivered instantly.
              </Typography>
            </Box>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 200,
                  height: 200,
                  borderRadius: '50%',
                  bgcolor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                }}
              >
                <Typography variant="h2" color="#9ca3af" fontWeight="200">
                  🔔
                </Typography>
              </Box>
            </Box>
          </Stack>
        </Stack>
      </PageLayout>

      {/* Simple Divider */}
      <Box sx={{ borderTop: '1px solid #f3f4f6' }} />

      {/* Social Proof */}
      <PageLayout maxWidth="lg" spacing={3} padding={{ xs: 4, md: 8 }}>
        <PageHeader
          title="Trusted by teams in retail, restaurants, healthcare & logistics"
          variant="compact"
        />
        <Typography
          variant="h6"
          color="#6b7280"
          fontWeight="300"
          sx={{ textAlign: 'center', maxWidth: 960, mx: 'auto', lineHeight: 1.7 }}
        >
          Keep everyone in sync with SMS, email, and push notifications. Shift changes, approvals,
          and updates are delivered instantly.
        </Typography>
      </PageLayout>

      {/* Final CTA */}
      <PageLayout maxWidth="md" spacing={3} padding={{ xs: 4, md: 8 }} fullWidth>
        <Box
          sx={{
            bgcolor: '#f9fafb',
            textAlign: 'center',
            py: { xs: 6, md: 8 },
            px: { xs: 3, md: 4 },
          }}
        >
          <PageHeader
            title="Ready to simplify your scheduling?"
            subtitle="Join thousands of teams who've streamlined their workforce management"
            variant="compact"
          />

          <Button
            href="/signup"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#1f2937',
              '&:hover': { bgcolor: '#111827' },
              px: 6,
              py: 2,
              fontWeight: 500,
              fontSize: '1.2rem',
            }}
          >
            Create free account
          </Button>
        </Box>
      </PageLayout>
    </Box>
  );
}
