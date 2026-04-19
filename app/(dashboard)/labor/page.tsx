'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const INK = '#0F1B2D';
const MUTED = '#5B677A';
const BORDER = 'rgba(15, 27, 45, 0.10)';

function hoursBetween(start: string, end: string): number {
  const [sH, sM] = (start || '0:00').split(':').map(Number);
  const [eH, eM] = (end || '0:00').split(':').map(Number);
  let mins = eH * 60 + eM - (sH * 60 + sM);
  if (mins < 0) mins += 24 * 60;
  return Math.round((mins / 60) * 100) / 100;
}

export default function LaborPage() {
  const [metrics, setMetrics] = useState<{
    scheduledHours: number;
    overtimeHours: number;
    laborPercent: number | null;
    forecastVariance: number | null;
  }>({ scheduledHours: 0, overtimeHours: 0, laborPercent: null, forecastVariance: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const schedules = await (await fetch('/api/schedules')).json();
        const sched = schedules?.[0] || null;
        let scheduledHours = 0;
        const hoursByUser: Record<string, number> = {};
        if (sched) {
          const shifts = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
          for (const s of shifts || []) {
            const h = hoursBetween(s.start, s.end);
            const slots = Math.max(1, s.requiredCount || s.assignments?.length || 1);
            scheduledHours += h * slots;
            for (const a of s.assignments || []) {
              const uid = a.userId;
              hoursByUser[uid] = (hoursByUser[uid] || 0) + h;
            }
          }
        }
        let overtimeHours = 0;
        for (const uid of Object.keys(hoursByUser)) {
          const total = hoursByUser[uid] || 0;
          if (total > 40) overtimeHours += total - 40;
        }
        if (!cancelled) {
          setMetrics({
            scheduledHours: Math.round(scheduledHours * 100) / 100,
            overtimeHours: Math.round(overtimeHours * 100) / 100,
            laborPercent: null,
            forecastVariance: null,
          });
        }
      } catch {
        if (!cancelled) setMetrics({ scheduledHours: 0, overtimeHours: 0, laborPercent: null, forecastVariance: null });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
              Labor
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Scheduled hours, overtime, and labor metrics
            </Typography>
          </Box>
        </Stack>
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2, mb: 2 }} />
        <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: '#0ea5e9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Labor
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Scheduled hours, overtime, and labor metrics
          </Typography>
        </Box>
      </Stack>
      <Box
        component={Paper}
        sx={{
          p: 4,
          border: '1px solid #e2e8f0',
          borderRadius: 2,
        }}
      >
      <Typography variant="body1" sx={{ color: '#475569', mb: 3 }}>
        Big numbers first. Labor % and forecast variance can be configured in org settings when
        available.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 2.5,
            border: `1px solid ${BORDER}`,
            borderRadius: 2,
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Scheduled hours
          </Typography>
          <Typography variant="h4" fontWeight="700" sx={{ color: INK, mt: 0.5 }}>
            {metrics.scheduledHours}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2.5,
            border: `1px solid ${BORDER}`,
            borderRadius: 2,
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Labor %
          </Typography>
          <Typography variant="h4" fontWeight="700" sx={{ color: INK, mt: 0.5 }}>
            {metrics.laborPercent != null ? `${metrics.laborPercent}%` : '—'}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2.5,
            border: `1px solid ${BORDER}`,
            borderRadius: 2,
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Overtime hours
          </Typography>
          <Typography variant="h4" fontWeight="700" sx={{ color: INK, mt: 0.5 }}>
            {metrics.overtimeHours}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 2.5,
            border: `1px solid ${BORDER}`,
            borderRadius: 2,
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Forecast variance
          </Typography>
          <Typography
            variant="h4"
            fontWeight="700"
            sx={{
              color:
                metrics.forecastVariance != null && metrics.forecastVariance < 0 ? '#ED6C02' : INK,
              mt: 0.5,
            }}
          >
            {metrics.forecastVariance != null
              ? `${metrics.forecastVariance > 0 ? '+' : ''}${metrics.forecastVariance}%`
              : '—'}
          </Typography>
        </Box>
      </Box>
      </Box>
    </Box>
  );
}
