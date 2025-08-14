'use client';
import PushOptIn from '@/components/PushOptIn';
import AppShell from '@/components/AppShell';
import { useEffect, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Stack,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
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
  const roles = ((session as any)?.roles || []) as string[];
  const orgId = (session as any)?.orgId || 'demo';
  const isManager = roles.some((r) => ['MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN'].includes(r));
  const [pendingInvites, setPendingInvites] = useState<number>(0);
  const [pendingSwaps, setPendingSwaps] = useState<number>(0);
  const [schedStatus, setSchedStatus] = useState<{
    hasUnpublishedChanges?: boolean;
    publishedAt?: string | null;
  } | null>(null);

  // Redirect bare /dashboard to org-scoped dashboard
  useEffect(() => {
    if (!pathname) return;
    if (!pathname.startsWith(`/org/`) && orgId) {
      router.replace(`/org/${orgId}/dashboard`);
    }
  }, [pathname, orgId, router]);

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
            const range = getCurrentWeekRange(today);
            const withinWeek = list.filter((s) => {
              const d = new Date(s.date);
              return d >= range.start && d <= range.end;
            });
            setWeekShifts(withinWeek);
          });
        // Announcements preview
        fetch('/api/announcements')
          .then((r) => r.json())
          .then((list: AnnouncementItem[]) => {
            const sorted = [...list].sort(
              (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
            );
            setAnnouncements(sorted.slice(0, 3));
          });
      } catch {}
    })();
  }, []);

  const weekHours = useMemo(
    () => weekShifts.reduce((acc, s) => acc + hoursBetween(s.start, s.end), 0),
    [weekShifts],
  );

  return (
    <AppShell>
      {isManager && (
        <>
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Typography variant="h5">Manager Dashboard</Typography>
            <Typography variant="body1" color="text.secondary">
              Quick overview and shortcuts for {orgName || 'your organization'}.
            </Typography>
          </Stack>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <PeopleAltIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Pending invites
                    </Typography>
                  </Stack>
                  <Typography variant="h5">{pendingInvites}</Typography>
                  <Typography
                    component={Link}
                    href={`/org/${orgId}/people`}
                    sx={{ textDecoration: 'underline' }}
                  >
                    Manage people
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <SwapHorizIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Swap requests
                    </Typography>
                  </Stack>
                  <Typography variant="h5">{pendingSwaps}</Typography>
                  <Typography
                    component={Link}
                    href={`/org/${orgId}/swaps`}
                    sx={{ textDecoration: 'underline' }}
                  >
                    Review swaps
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <AssessmentIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Schedule status
                    </Typography>
                  </Stack>
                  <Typography variant="body1">
                    {schedStatus?.hasUnpublishedChanges ? 'Unpublished changes' : 'Up to date'}
                  </Typography>
                  {schedStatus?.publishedAt && (
                    <Typography variant="caption" color="text.secondary">
                      Last published: {new Date(schedStatus.publishedAt).toLocaleString?.()}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Typography
                      component={Link}
                      href={`/org/${orgId}/schedule`}
                      sx={{ textDecoration: 'underline' }}
                    >
                      Open Schedule
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <ViewWeekIcon fontSize="small" color="primary" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Coverage
                    </Typography>
                  </Stack>
                  <Typography variant="body1">Plan coverage and generate schedules.</Typography>
                  <Typography
                    component={Link}
                    href={`/org/${orgId}/coverage`}
                    sx={{ textDecoration: 'underline' }}
                  >
                    Open Coverage
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <CampaignIcon fontSize="small" color="primary" />
            <Typography variant="subtitle2" color="text.secondary">
              Announcements
            </Typography>
          </Stack>
          {announcements.length > 0 ? (
            <List dense>
              {announcements.map((a) => (
                <ListItem key={a._id} disableGutters>
                  <ListItemText
                    primary={a.title}
                    secondary={a.body}
                    primaryTypographyProps={{ variant: 'body1' }}
                    secondaryTypographyProps={{ variant: 'body1', color: 'text.secondary' }}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No announcements
            </Typography>
          )}
        </CardContent>
      </Card>
      {/* Removed employee dashboard summary content */}
    </AppShell>
  );

  function getCurrentWeekRange(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  function hoursBetween(start: string, end: string) {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh + em / 60 - (sh + sm / 60);
  }
}

type MyShift = { _id: string; date: string; start: string; end: string; positionName?: string };
type AnnouncementItem = { _id: string; title: string; body: string; createdAt?: string };
