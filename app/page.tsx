import AppShell from '../components/AppShell';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Stack, Typography, Grid, Paper } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import BoltIcon from '@mui/icons-material/Bolt';

export default function Page() {
  return (
    <AppShell>
      <Stack spacing={6}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="h3">Smarter shift scheduling for teams</Typography>
            <Typography variant="h6" color="text.secondary">
              Plan coverage in minutes, not hours. Keep your team informed and your floor covered.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Link href="/join">
                <Button variant="contained" size="large">
                  Sign Up
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outlined" size="large">
                  View Demo
                </Button>
              </Link>
            </Stack>
          </Stack>
          <Paper sx={{ p: 2, flex: 1, display: 'flex', justifyContent: 'center' }}>
            <Image src="/icon-384.png" alt="Scheduling preview" width={384} height={384} />
          </Paper>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <AccessTimeIcon color="primary" />
                <Typography variant="h6">Fast scheduling</Typography>
                <Typography color="text.secondary">
                  Build and publish a schedule in minutes with intelligent coverage assistance.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <GroupIcon color="primary" />
                <Typography variant="h6">Team communication</Typography>
                <Typography color="text.secondary">
                  Keep staff up to date with announcements, notifications, and swap requests.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <BoltIcon color="primary" />
                <Typography variant="h6">Automated workflows</Typography>
                <Typography color="text.secondary">
                  Let automation handle recurring tasks like publishing and reminders.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
