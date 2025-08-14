'use client';
import AppShell from '@/components/AppShell';
import OrgSearch from '@/components/OrgSearch';
import { useEffect, useState } from 'react';
import { Grid, Paper, Stack, Typography, TextField } from '@mui/material';

export default function AdminDrilldown() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState('');
  useEffect(() => {
    fetch('/api/admin/metrics/top?limit=10')
      .then((r) => r.json())
      .then(setData);
  }, []);
  if (!data) return null;
  return (
    <AppShell>
      <Stack spacing={2}>
        <Paper sx={{ p: 2 }}>
          <OrgSearch />
        </Paper>
        <Typography variant="h5">Super Admin — Drilldowns</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Top Orgs by Users</Typography>
              <TextField
                size="small"
                placeholder="Search orgs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ mt: 1, mb: 1 }}
              />
              <Stack spacing={1} sx={{ mt: 1 }}>
                {data.topOrgs.map((o: any) => (
                  <div key={o.orgId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>
                      {o.name}{' '}
                      {o.suspended ? (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            border: '1px solid #ed6c02',
                            borderRadius: 8,
                            marginLeft: 6,
                            color: '#ed6c02',
                          }}
                        >
                          SUSPENDED
                        </span>
                      ) : null}
                    </span>
                    <span style={{ textAlign: 'right' }}>
                      <div>{o.users} users</div>
                      <div style={{ fontSize: 12, opacity: 0.7 }}>
                        Plan: {o.plan} • {o.seats?.used}/{o.seats?.limit}
                      </div>
                      <div
                        style={{
                          height: 6,
                          background: '#eee',
                          borderRadius: 3,
                          overflow: 'hidden',
                          marginTop: 4,
                        }}
                      >
                        {(() => {
                          const pct = Math.min(100, Math.round((o.seats?.pct || 0) * 100));
                          const color = pct < 70 ? '#2e7d32' : pct < 90 ? '#ed6c02' : '#d32f2f';
                          return (
                            <div style={{ width: `${pct}%`, height: '100%', background: color }} />
                          );
                        })()}
                      </div>
                    </span>
                  </div>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1">Top Active Users (30d by notifications)</Typography>
              <Stack spacing={1} sx={{ mt: 1 }}>
                {data.topUsers.map((u: any) => (
                  <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{u._id}</span>
                    <span>{u.notifs} events</span>
                  </div>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>
    </AppShell>
  );
}
