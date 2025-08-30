'use client';
import PushOptIn from '@/components/PushOptIn';
import AppShell from '@/components/AppShell';
import { PageHeader, PageLayout } from '@/components/page';
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TodayIcon from '@mui/icons-material/Today';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CampaignIcon from '@mui/icons-material/Campaign';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import Link from 'next/link';

export default function Dashboard() {
  const [nextShift, setNextShift] = useState<string>('—');
  const [todayShifts, setTodayShifts] = useState<MyShift[]>([]);
  const [weekShifts, setWeekShifts] = useState<MyShift[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [orgName, setOrgName] = useState<string>('');
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  // Support demo/mock session when NextAuth session is not present
  const mock = (() => {
    if (typeof document === 'undefined') return null;
    try {
      const m = document.cookie.match(/__mocksession=([^;]+)/);
      if (!m) return null;
      return JSON.parse(decodeURIComponent(m[1]));
    } catch {
      return null;
    }
  })();
  const roles = (((session as any)?.roles || (mock?.roles as string[]) || []) as string[]).map(
    (r) => String(r).toUpperCase(),
  );
  const orgId = ((session as any)?.orgId as string) || (mock?.orgId as string) || null;
  const isManager = roles.some((r) => ['MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN'].includes(r));
  const [pendingInvites, setPendingInvites] = useState<number>(0);
  const [pendingSwaps, setPendingSwaps] = useState<number>(0);
  const [schedStatus, setSchedStatus] = useState<{
    hasUnpublishedChanges?: boolean;
    publishedAt?: string | null;
  } | null>(null);
  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>('default');

  // Redirect bare /dashboard to org-scoped dashboard only if the user has an org
  useEffect(() => {
    if (!pathname) return;
    if (!pathname.startsWith(`/org/`) && orgId) {
      router.replace(`/org/${orgId}/dashboard`);
    }
  }, [pathname, orgId, router]);

  // If user is not in a manager-like role, route them to their primary home instead of dashboard
  useEffect(() => {
    if (!orgId) return;
    if (isManager) return;
    const p = pathname || '';
    const isOnDashboard = p === '/dashboard' || /\/org\/[^/]+\/dashboard$/.test(p);
    if (isOnDashboard) {
      router.replace(`/org/${orgId}/myschedule`);
    }
  }, [isManager, orgId, pathname, router]);

  // Request notification permission on initial page load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      // Show a subtle notification permission request
      const requestPermission = async () => {
        try {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
        } catch (error) {
          console.log('Notification permission request failed:', error);
        }
      };

      // Delay the request slightly to not interrupt the initial page load
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  // Managers can now view the dashboard; remove other redirects

  useEffect(() => {
    (async () => {
      try {
        const rolesRes = await fetch('/api/me/roles', { cache: 'no-store' });
        const roles = await rolesRes.json();
        const ok = Array.isArray(roles.roles) && roles.roles.length > 0;
        if (!ok) return;
        // Load org name
        try {
          const org = await (await fetch('/api/org')).json();
          if (org?.name) setOrgName(org.name);
        } catch {}

        if (isManager) {
          // Manager widgets
          try {
            const inv = await (await fetch('/api/invites')).json();
            setPendingInvites(
              Array.isArray(inv) ? inv.filter((x: any) => x.status === 'PENDING').length : 0,
            );
          } catch {}
          try {
            const swaps = await (await fetch('/api/swaps')).json();
            setPendingSwaps(Array.isArray(swaps) ? swaps.length : 0);
          } catch {}
          try {
            const st = await (await fetch('/api/schedules/status')).json();
            setSchedStatus(st);
          } catch {}
        }
        fetch('/api/my/shifts?next=1')
          .then((r) => r.json())
          .then((d) => {
            if (d && d.length)
              setNextShift(`${new Date(d[0].date).toDateString()} ${d[0].start}-${d[0].end}`);
          });
        // Load shifts for today and this week
        const month = new Date().toISOString().slice(0, 7);
        fetch('/api/my/shifts?month=' + month)
          .then((r) => r.json())
          .then((list: MyShift[]) => {
            const today = new Date();
            const todayStr = today.toISOString().slice(0, 10);
            const todays = list.filter(
              (s) => new Date(s.date).toISOString().slice(0, 10) === todayStr,
            );
            setTodayShifts(todays);
            // Get this week's shifts
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const thisWeek = list.filter(
              (s) => new Date(s.date) >= weekStart && new Date(s.date) <= weekEnd,
            );
            setWeekShifts(thisWeek);
          });
        // Load announcements
        fetch('/api/announcements')
          .then((r) => r.json())
          .then((list) => {
            const recent = list
              .filter(
                (x: any) =>
                  x.pinned ||
                  new Date(x.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
              )
              .slice(0, 3);
            setAnnouncements(recent);
          });
      } catch {}
    })();
  }, [isManager]);

  return (
    <AppShell>
      <PageLayout spacing={4}>
        {/* Compact Scrolling Announcements */}
        {announcements.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight="400" sx={{ mb: 1, color: '#374151' }}>
              Announcements
            </Typography>
            <Box
              sx={{
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  animation: 'scroll 25s linear infinite',
                  '@keyframes scroll': {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(-100%)' },
                  },
                  '&:hover': {
                    animationPlayState: 'paused',
                  },
                }}
              >
                {announcements.map((ann: any) => (
                  <Box
                    key={ann._id}
                    sx={{
                      minWidth: 260,
                      p: 1.5,
                      bgcolor: 'grey.50',
                      borderRadius: 1,
                      flexShrink: 0,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="600"
                      color="text.primary"
                      sx={{ mb: 0.5 }}
                    >
                      {ann.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {ann.body}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        )}

        <Typography
          variant="h5"
          fontWeight="400"
          sx={{
            mb: 3,
            color: '#374151',
            fontSize: { xs: '1.25rem', md: '1.5rem' },
          }}
        >
          Dashboard
        </Typography>

        <Stack spacing={4}>
          {/* Quick Stats */}
          <Box>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Card
                sx={{
                  flex: 1,
                  border: '1px solid #f3f4f6',
                  borderRadius: 2,
                  bgcolor: '#fff',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <CalendarTodayIcon sx={{ fontSize: 40, color: '#6b7280', mb: 1 }} />
                  <Typography variant="h6" fontWeight="400" sx={{ mb: 1, color: '#1f2937' }}>
                    Next Shift
                  </Typography>
                  <Typography variant="body2" color="#6b7280" fontWeight="300">
                    {nextShift}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  flex: 1,
                  border: '1px solid #f3f4f6',
                  borderRadius: 2,
                  bgcolor: '#fff',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <TodayIcon sx={{ fontSize: 40, color: '#6b7280', mb: 1 }} />
                  <Typography variant="h6" fontWeight="400" sx={{ mb: 1, color: '#1f2937' }}>
                    Today's Shifts
                  </Typography>
                  <Typography variant="body2" color="#6b7280" fontWeight="300">
                    {todayShifts.length} shifts
                  </Typography>
                </CardContent>
              </Card>

              <Card
                sx={{
                  flex: 1,
                  border: '1px solid #f3f4f6',
                  borderRadius: 2,
                  bgcolor: '#fff',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <DateRangeIcon sx={{ fontSize: 40, color: '#6b7280', mb: 1 }} />
                  <Typography variant="h6" fontWeight="400" sx={{ mb: 1, color: '#1f2937' }}>
                    This Week
                  </Typography>
                  <Typography variant="body2" color="#6b7280" fontWeight="300">
                    {weekShifts.length} shifts
                  </Typography>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          {/* Manager Widgets */}
          {isManager && (
            <Box>
              <Typography
                variant="h5"
                fontWeight="400"
                sx={{
                  mb: 3,
                  color: '#374151',
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                }}
              >
                Management
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                <Card
                  sx={{
                    flex: 1,
                    border: '1px solid #f3f4f6',
                    borderRadius: 2,
                    bgcolor: '#fff',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <PeopleAltIcon sx={{ fontSize: 40, color: '#6b7280', mb: 1 }} />
                    <Typography variant="h6" fontWeight="400" sx={{ mb: 1, color: '#1f2937' }}>
                      Pending Invites
                    </Typography>
                    <Typography variant="body2" color="#6b7280" fontWeight="300">
                      {pendingInvites} invites
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    flex: 1,
                    border: '1px solid #f3f4f6',
                    borderRadius: 2,
                    bgcolor: '#fff',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <SwapHorizIcon sx={{ fontSize: 40, color: '#6b7280', mb: 1 }} />
                    <Typography variant="h6" fontWeight="400" sx={{ mb: 1, color: '#1f2937' }}>
                      Pending Swaps
                    </Typography>
                    <Typography variant="body2" color="#6b7280" fontWeight="300">
                      {pendingSwaps} requests
                    </Typography>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    flex: 1,
                    border: '1px solid #f3f4f6',
                    borderRadius: 2,
                    bgcolor: '#fff',
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', p: 3 }}>
                    <ViewWeekIcon sx={{ fontSize: 40, color: '#6b7280', mb: 1 }} />
                    <Typography variant="h6" fontWeight="400" sx={{ mb: 1, color: '#1f2937' }}>
                      Schedule Status
                    </Typography>
                    <Typography variant="body2" color="#6b7280" fontWeight="300">
                      {schedStatus?.hasUnpublishedChanges ? 'Has changes' : 'Up to date'}
                    </Typography>
                  </CardContent>
                </Card>
              </Stack>
            </Box>
          )}
        </Stack>
      </PageLayout>
    </AppShell>
  );
}

type MyShift = { _id: string; date: string; start: string; end: string; positionName?: string };
type AnnouncementItem = { _id: string; title: string; body: string; createdAt?: string };
