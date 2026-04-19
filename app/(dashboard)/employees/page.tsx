'use client';

import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';

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

export default function EmployeesPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [users, setUsers] = useState<any[]>([]);
  const [hoursByUser, setHoursByUser] = useState<Record<string, number>>({});
  const [positionsById, setPositionsById] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [usersRes, schedulesRes, positionsRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/schedules'),
          fetch('/api/positions'),
        ]);
        const usersList = await usersRes.json();
        const schedules = await schedulesRes.json();
        const positions = await positionsRes.json();
        if (cancelled) return;
        setUsers(Array.isArray(usersList) ? usersList : []);
        const posMap: Record<string, any> = {};
        for (const p of positions || []) posMap[String(p._id)] = p;
        setPositionsById(posMap);

        const sched = schedules?.[0];
        const hours: Record<string, number> = {};
        if (sched) {
          const shifts = await (await fetch(`/api/shifts?scheduleId=${sched._id}`)).json();
          for (const s of shifts || []) {
            const h = hoursBetween(s.start, s.end);
            for (const a of s.assignments || []) {
              const uid = a.userId;
              hours[uid] = (hours[uid] || 0) + h;
            }
          }
        }
        if (!cancelled) setHoursByUser(hours);
      } catch {
        if (!cancelled) {
          setUsers([]);
          setHoursByUser({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return users.map((u) => {
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.name || u.email || '—';
      const roleIds = u.positions || u.roles || [];
      const roles = roleIds.map((id: string) => positionsById[id]?.name || id).filter(Boolean);
      const rolesLabel = roles.length ? roles.join(', ') : '—';
      const hoursThisWeek = hoursByUser[u._id] ?? 0;
      const overtimeRisk = hoursThisWeek >= 40;
      return { id: u._id, name, rolesLabel, hoursThisWeek, overtimeRisk };
    });
  }, [users, positionsById, hoursByUser]);

  if (loading) {
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
            <PeopleIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
              Employees
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              List with roles, hours this week, and overtime risk
            </Typography>
          </Box>
        </Stack>
        <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <Skeleton variant="rectangular" height={40} sx={{ mb: 1.5, borderRadius: 2 }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rectangular" height={56} sx={{ mb: 1.5, borderRadius: 2 }} />
          ))}
        </Paper>
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
            bgcolor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <PeopleIcon sx={{ fontSize: 32, color: 'white' }} />
        </Box>
        <Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: '#0f172a' }}>
            Employees
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            List with roles, hours this week, and overtime risk
          </Typography>
        </Box>
      </Stack>
      <Paper sx={{ p: 4, border: '1px solid #e2e8f0', borderRadius: 2 }}>
        <Typography variant="body1" sx={{ color: '#475569', mb: 3 }}>
          Employee detail can be opened later.
        </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '1fr 1fr 100px 120px' : '1fr 1fr auto',
          gap: 1.5,
          alignItems: 'center',
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${BORDER}`,
          bgcolor: 'rgba(15,27,45,0.03)',
          borderRadius: 2,
          mb: 1.5,
          fontSize: '0.75rem',
          fontWeight: 700,
          color: MUTED,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        <span>Name</span>
        <span>Roles</span>
        {isDesktop && <span>Hours this week</span>}
        <span>Overtime</span>
      </Box>
      {rows.map((emp) => (
        <Box
          key={emp.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr 100px 120px' : '1fr 1fr auto',
            gap: 1.5,
            alignItems: 'center',
            px: 2,
            py: 1.5,
            border: `1px solid ${BORDER}`,
            borderRadius: 2,
            mb: 1.5,
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography fontWeight="600" sx={{ color: INK, fontSize: '0.9375rem' }}>
            {emp.name}
          </Typography>
          <Typography sx={{ color: MUTED, fontSize: '0.875rem' }}>
            {emp.rolesLabel}
          </Typography>
          {isDesktop && (
            <Typography sx={{ color: INK, fontSize: '0.875rem' }}>
              {emp.hoursThisWeek > 0 ? `${emp.hoursThisWeek} h` : '—'}
            </Typography>
          )}
          <Chip
            size="small"
            label={emp.overtimeRisk ? 'Risk' : 'OK'}
            sx={{
              width: 'fit-content',
              bgcolor: emp.overtimeRisk ? 'rgba(237,108,2,0.12)' : 'rgba(47,174,158,0.12)',
              color: emp.overtimeRisk ? '#ED6C02' : '#2FAE9E',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
        </Box>
      ))}
      </Paper>
    </Box>
  );
}
