'use client';
import { Box, Typography, Paper, FormControlLabel, Switch, Stack } from '@mui/material';
import { useEffect, useState } from 'react';
import PolicyIcon from '@mui/icons-material/Policy';

export default function PolicyPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const load = async () => {
    setLoading(true);
    try {
      const p = await (await fetch('/api/policy')).json();
      setPolicy(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updatePolicy = (next: any) => {
    setPolicy(next);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PolicyIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Organization Policy
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Configure organizational rules and settings
          </Typography>
        </Box>
      </Stack>
      
      <Paper sx={{ p: 4, mb: 3, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 3, color: '#0f172a', fontWeight: 600 }}>
          Shift Settings
        </Typography>
        {loading || !policy ? (
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Loading...
          </Typography>
        ) : (
          <Box sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={policy.shifts?.allowOpenEnded || false}
                  onChange={async (e) => {
                    const updated = {
                      ...policy,
                      shifts: { ...policy.shifts, allowOpenEnded: e.target.checked },
                    };
                    const res = await fetch('/api/policy', {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(updated),
                    });
                    if (!res.ok) return;
                    updatePolicy(updated);
                  }}
                />
              }
              label={
                <Box>
                  <Typography variant="body1" fontWeight="500" sx={{ color: '#0f172a' }}>
                    Allow shifts without end time
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Enable open-ended shifts with only a start time for flexible scheduling
                  </Typography>
                </Box>
              }
            />
          </Box>
        )}
      </Paper>
      
      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fafafa' }}>
        <Typography variant="body1" sx={{ color: '#64748b' }}>
          Additional policy settings will be available here in a future update.
        </Typography>
      </Paper>
    </Box>
  );
}
