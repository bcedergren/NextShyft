'use client';
import AppShell from '../../../components/AppShell';
import { useEffect, useState } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

function Chart({ title, data }: { title: string; data: any[] }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Paper>
  );
}

export default function AdminMetrics() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch('/api/admin/metrics')
      .then((r) => r.json())
      .then(setData);
  }, []);
  if (!data) return null;
  const s = data.series || {};
  const t = data.totals || {};
  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Super Admin Metrics</Typography>
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{t.orgs}</Typography>
              <Typography variant="caption">Organizations</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{t.users}</Typography>
              <Typography variant="caption">Users</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{t.schedules}</Typography>
              <Typography variant="caption">Schedules</Typography>
            </Paper>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', md: '1 1 calc(25% - 6px)' } }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">{t.notifications}</Typography>
              <Typography variant="caption">Notifications</Typography>
            </Paper>
          </Box>
        </Stack>
        <Chart title="Orgs created (30d)" data={s.orgs || []} />
        <Chart title="Users created (30d)" data={s.users || []} />
        <Chart title="Schedules created (30d)" data={s.schedules || []} />
        <Chart title="Notifications created (30d)" data={s.notifications || []} />
        <Chart title="Swaps created (30d)" data={s.swaps || []} />
        <a href="/admin/metrics/drilldown" className="underline self-start">
          Open Drilldowns
        </a>
      </Stack>
    </AppShell>
  );
}
