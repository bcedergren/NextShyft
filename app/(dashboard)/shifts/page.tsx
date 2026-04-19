'use client';

import { Box, Button, Paper, Stack, Typography, Skeleton } from '@mui/material';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ShiftsPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.orgId ?? null;
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((d) => setTemplates(Array.isArray(d) ? d : []))
      .catch(() => setTemplates([]))
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
            bgcolor: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ViewWeekIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Shifts
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Manage shift templates and schedules
          </Typography>
        </Box>
      </Stack>

      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ color: '#475569', mb: 2 }}>
          Create shift templates, set recurring schedules, and manage time slots for your team.
        </Typography>
        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1 }} />
          </Stack>
        ) : templates.length === 0 ? (
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No shift templates yet.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {templates.slice(0, 10).map((t) => (
              <Box
                key={t._id}
                sx={{
                  py: 1,
                  px: 2,
                  border: '1px solid #e2e8f0',
                  borderRadius: 1,
                  bgcolor: '#f8fafc',
                }}
              >
                <Typography variant="body2">
                  {t.positionName || t.positionId || t._id} — {t.start || '—'}–{t.end || '—'}
                </Typography>
              </Box>
            ))}
            {templates.length > 10 && (
              <Typography variant="body2" color="text.secondary">
                +{templates.length - 10} more
              </Typography>
            )}
          </Stack>
        )}
        {orgId ? (
          <Button component={Link} href={`/org/${orgId}/templates`} variant="contained">
            Manage templates in your organization
          </Button>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Sign in and select an organization to manage shift templates.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
