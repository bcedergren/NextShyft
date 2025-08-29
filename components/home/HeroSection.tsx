'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Stack, Typography, Paper } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

export default function HeroSection() {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={6} alignItems="center" sx={{ py: 4 }}>
      <Stack spacing={3} sx={{ flex: 1 }}>
        <Typography variant="h2" component="h1" fontWeight="bold">
          Smarter shift scheduling for teams
        </Typography>
        <Typography variant="h5" color="text.secondary" lineHeight={1.6}>
          Plan coverage in minutes, not hours. Keep your team informed and your floor covered with
          intelligent scheduling that adapts to your business needs.
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Link href="/signup">
            <Button variant="contained" size="large" sx={{ px: 4, py: 1.5 }}>
              Start Free Trial
            </Button>
          </Link>
          <Link href="/demo">
            <Button variant="outlined" size="large" sx={{ px: 4, py: 1.5 }}>
              View Demo
            </Button>
          </Link>
        </Stack>
        <Stack direction="row" spacing={3} alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <StarIcon color="primary" fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              4.9/5 rating
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            •
          </Typography>
          <Typography variant="body2" color="text.secondary">
            10,000+ teams trust us
          </Typography>
        </Stack>
      </Stack>
      <Paper sx={{ p: 3, flex: 1, display: 'flex', justifyContent: 'center' }}>
        <Image src="/images/hero.png" alt="Scheduling preview" width={480} height={340} />
      </Paper>
    </Stack>
  );
}
