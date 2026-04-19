'use client';

import { Box, Typography, Paper, Stack, Skeleton } from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { useEffect, useState } from 'react';

export default function PositionsPage() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/positions')
      .then((r) => r.json())
      .then((d) => setPositions(Array.isArray(d) ? d : []))
      .catch(() => setPositions([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <WorkOutlineIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Positions
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Manage job positions and roles
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ color: '#475569', mb: 2 }}>
          Create and manage job positions, assign roles, and set requirements for your
          organization.
        </Typography>
        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          </Stack>
        ) : positions.length === 0 ? (
          <Typography color="text.secondary">No positions yet. Add positions in your organization settings.</Typography>
        ) : (
          <Stack spacing={1}>
            {positions.map((p) => (
              <Box
                key={p._id}
                sx={{
                  py: 1.5,
                  px: 2,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  bgcolor: '#f8fafc',
                }}
              >
                <Typography fontWeight="600" sx={{ color: '#0f172a' }}>
                  {p.name || p._id}
                </Typography>
                {p.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {p.description}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
