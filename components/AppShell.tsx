'use client';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import Image from 'next/image';
import NotifBell from '@/components/NotifBell';
import SuspendedBanner from '@/components/SuspendedBanner';
import SuspendedGate from '@/components/SuspendedGate';
import ReadOnlyStyles from '@/components/ReadOnlyStyles';
import ManagerSideNav from '@/components/ManagerSideNav';
import ManagerNav from '@/components/ManagerNav';
import RateLimitToast from '@/components/RateLimitToast';
import UpgradeChip from '@/components/UpgradeChip';
import ReadonlyBypassToggle from '@/components/ReadonlyBypassToggle';
import ManagerSettingsMenu from '@/components/ManagerSettingsMenu';
import { Alert, IconButton as MIconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HomeIcon from '@mui/icons-material/Home';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CampaignIcon from '@mui/icons-material/Campaign';
import LogoutIcon from '@mui/icons-material/Logout';

function PinnedAnnouncement() {
  const [ann, setAnn] = useState<any | null>(null);
  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((list) => {
        const pinned = list.find((x: any) => x.pinned);
        setAnn(pinned || null);
      })
      .catch(() => {});
  }, []);
  if (!ann) return null;
  const dismiss = async () => {
    try {
      await fetch('/api/announcements/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ann._id }),
      });
    } finally {
      setAnn(null);
    }
  };
  return (
    <Alert
      severity="info"
      action={
        <IconButton color="inherit" size="small" onClick={dismiss}>
          <CloseIcon fontSize="inherit" />
        </IconButton>
      }
      sx={{ borderRadius: 0 }}
    >
      <strong>{ann.title}</strong>&nbsp;— {ann.body}
    </Alert>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<string[]>([]);
  const path = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const authed = status !== 'unauthenticated' || roles.length > 0;
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch('/api/me/roles', { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        const list = Array.isArray(d.roles) ? d.roles : [];
        if (alive) setRoles(list);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);
  const sessionRoles = ((session as any)?.roles || []) as string[];
  const effectiveRoles = (roles.length > 0 ? roles : sessionRoles).map((r) =>
    String(r).toUpperCase(),
  );
  const isManager = ['MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN'].some((r) =>
    effectiveRoles.includes(r),
  );
  const orgIdFromPath = (() => {
    const m = (path || '').match(/^\/org\/([^\/]+)/);
    return m?.[1] || null;
  })();
  const orgId = orgIdFromPath || (session as any)?.orgId || 'demo';
  const employeeNavActive = /^\/org\/[^/]+\/(myschedule|me|hours|inbox|profile)/.test(path || '');
  const onSchedulePage =
    (path || '').startsWith(`/org/${orgId}/schedule`) ||
    (path || '').startsWith(`/org/${orgId}/wizard`);
  const onDashboard =
    path?.startsWith(`/org/${orgId}/dashboard`) || path?.startsWith('/dashboard') || false;
  const sectionMatch = (path || '').match(/^\/org\/[^/]+\/(myschedule|me|hours|inbox|profile)/);
  const section = onDashboard ? 'dashboard' : sectionMatch?.[1] || '';
  const isCoveragePage = (path || '').startsWith(`/org/${orgId}/coverage`);
  const isSchedulePage = (path || '').startsWith(`/org/${orgId}/schedule`);
  const isShiftsPage = (path || '').startsWith(`/org/${orgId}/shifts`);
  const isPositionsPage = (path || '').startsWith(`/org/${orgId}/positions`);
  const tabIds: string[] = ['dashboard', 'myschedule', 'me', 'hours', 'profile'];
  const tabDefs = tabIds.map((id) => ({
    id,
    label:
      id === 'myschedule'
        ? 'Schedule'
        : id === 'me'
          ? 'Availability'
          : id === 'hours'
            ? 'Hours'
            : id === 'inbox'
              ? 'Inbox'
              : id === 'profile'
                ? 'Profile'
                : 'Dashboard',
  }));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const employeeTabIndex = Math.max(0, tabIds.indexOf(section));
  const handleEmployeeTab = (_: any, idx: number) => {
    const id = tabIds[idx] || 'me';
    if (id === 'dashboard') router.push(`/org/${orgId}/dashboard`);
    else router.push(`/org/${orgId}/${id}`);
  };
  const onManagerNav = (target: 'dashboard' | 'schedule' | 'people' | 'reports') => {
    router.push(`/org/${orgId}/${target}`);
  };
  const managerActiveIndex = (() => {
    const base = `/org/${orgId}`;
    if ((path || '').startsWith(`${base}/schedule`)) return 0;
    if ((path || '').startsWith(`${base}/people`)) return 1;
    if ((path || '').startsWith(`${base}/reports`)) return 2;
    return -1;
  })();
  const managerSideNavRoutes = new RegExp(
    `^/org/${orgId}/(positions|shifts|wizard|coverage|policy|holidays|org-settings)`,
  );
  const showManagerSideNav =
    !employeeNavActive && (managerSideNavRoutes.test(path || '') || onSchedulePage);
  const showManagerTopNav = !employeeNavActive && (path || '').startsWith(`/org/${orgId}/`);
  // Removed More menu; promote items to the top navbar
  return (
    <>
      <Box>
        <AppBar position="sticky" elevation={0}>
          <Toolbar sx={{ gap: 1, px: 1, position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mr: { xs: 0, md: 2 },
                position: { xs: 'absolute', md: 'static' },
                left: { xs: '50%', md: 'auto' },
                transform: { xs: 'translateX(-50%)', md: 'none' },
              }}
            >
              <Image src="/logo.png" alt="NextShyft" width={120} height={32} priority />
            </Box>
            {/* Employee navbar links removed */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
              {showManagerTopNav && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                  {/* Desktop navbar items (hidden on mobile) */}
                  <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Dashboard">
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => router.push(`/org/${orgId}/dashboard`)}
                        startIcon={<HomeIcon />}
                        sx={{ textTransform: 'none', opacity: 0.85 }}
                      >
                        Dashboard
                      </Button>
                    </Tooltip>
                    <Tooltip title="Schedule">
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => onManagerNav('schedule')}
                        startIcon={<ViewWeekIcon />}
                        sx={{
                          textTransform: 'none',
                          opacity: managerActiveIndex === 0 ? 1 : 0.85,
                          fontWeight: managerActiveIndex === 0 ? 600 : 400,
                        }}
                      >
                        Schedule
                      </Button>
                    </Tooltip>
                    {/* Keep People and Reports in top nav across all pages; exclude sidebar items */}
                    <Tooltip title="People">
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => onManagerNav('people')}
                        startIcon={<PeopleIcon />}
                        sx={{
                          textTransform: 'none',
                          opacity: managerActiveIndex === 1 ? 1 : 0.85,
                          fontWeight: managerActiveIndex === 1 ? 600 : 400,
                        }}
                      >
                        People
                      </Button>
                    </Tooltip>
                    <Tooltip title="Reports">
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => onManagerNav('reports')}
                        startIcon={<AnalyticsIcon />}
                        sx={{
                          textTransform: 'none',
                          opacity: managerActiveIndex === 2 ? 1 : 0.85,
                          fontWeight: managerActiveIndex === 2 ? 600 : 400,
                        }}
                      >
                        Reports
                      </Button>
                    </Tooltip>
                    <Tooltip title="Directory">
                      <Button
                        color="inherit"
                        size="small"
                        startIcon={<PeopleIcon />}
                        onClick={() => router.push(`/org/${orgId}/directory`)}
                        sx={{ textTransform: 'none', opacity: 0.85 }}
                      >
                        Directory
                      </Button>
                    </Tooltip>
                    <Tooltip title="Swaps">
                      <Button
                        color="inherit"
                        size="small"
                        startIcon={<SwapHorizIcon />}
                        onClick={() => router.push(`/org/${orgId}/swaps`)}
                        sx={{ textTransform: 'none', opacity: 0.85 }}
                      >
                        Swaps
                      </Button>
                    </Tooltip>

                    <Tooltip title="Announcements">
                      <Button
                        color="inherit"
                        size="small"
                        startIcon={<CampaignIcon />}
                        onClick={() => router.push(`/org/${orgId}/announcements`)}
                        sx={{ textTransform: 'none', opacity: 0.85 }}
                      >
                        Announcements
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>
              )}
              {authed ? (
                <>
                  <ReadonlyBypassToggle />
                  <UpgradeChip />
                  <NotifBell />
                  {isManager && <ManagerSettingsMenu />}
                  {/* Mobile hamburger moved to the right of the notification bell */}
                  <IconButton
                    color="inherit"
                    size="small"
                    aria-label="menu"
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{ display: { xs: 'inline-flex', md: 'none' }, ml: 0.5 }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Button
                    onClick={() => signOut({ callbackUrl: '/signin' })}
                    color="inherit"
                    size="small"
                    sx={{ display: { xs: 'none', md: 'inline-flex' } }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button href="/signin" variant="contained" size="small">
                  Sign In
                </Button>
              )}
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="right"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          ModalProps={{ keepMounted: true }}
        >
          <Box
            sx={{ width: 260, display: 'flex', flexDirection: 'column', height: '100%' }}
            role="presentation"
            onClick={() => setMobileMenuOpen(false)}
          >
            <List>
              <ListItemButton onClick={() => router.push(`/org/${orgId}/dashboard`)}>
                <ListItemIcon>
                  <HomeIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
              <ListItemButton onClick={() => router.push(`/org/${orgId}/schedule`)}>
                <ListItemIcon>
                  <ViewWeekIcon />
                </ListItemIcon>
                <ListItemText primary="Schedule" />
              </ListItemButton>
              <ListItemButton onClick={() => router.push(`/org/${orgId}/people`)}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="People" />
              </ListItemButton>

              <ListItemButton onClick={() => router.push(`/org/${orgId}/reports`)}>
                <ListItemIcon>
                  <AnalyticsIcon />
                </ListItemIcon>
                <ListItemText primary="Reports" />
              </ListItemButton>
              <ListItemButton onClick={() => router.push(`/org/${orgId}/directory`)}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Directory" />
              </ListItemButton>
              <ListItemButton onClick={() => router.push(`/org/${orgId}/swaps`)}>
                <ListItemIcon>
                  <SwapHorizIcon />
                </ListItemIcon>
                <ListItemText primary="Swaps" />
              </ListItemButton>

              <ListItemButton onClick={() => router.push(`/org/${orgId}/wizard`)}>
                <ListItemIcon>
                  <AutoFixHighIcon />
                </ListItemIcon>
                <ListItemText primary="Wizard" />
              </ListItemButton>
              <ListItemButton onClick={() => router.push(`/org/${orgId}/announcements`)}>
                <ListItemIcon>
                  <CampaignIcon />
                </ListItemIcon>
                <ListItemText primary="Announcements" />
              </ListItemButton>
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <List>
              <ListItemButton onClick={() => signOut({ callbackUrl: '/signin' })}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Sign Out" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>
        {/* Employee mobile menu removed */}
        <SuspendedBanner />
        <SuspendedGate />
        <PinnedAnnouncement />

        <Container
          disableGutters
          sx={{ py: 2, px: 1, pb: { xs: 8, md: 2 } }}
          maxWidth={
            isCoveragePage || isSchedulePage || isShiftsPage || isPositionsPage ? false : 'xl'
          }
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            {showManagerSideNav && <ManagerSideNav />}
            <Box sx={{ flex: 1, width: '100%' }}>{children}</Box>
          </Box>
        </Container>
        {/* Mobile bottom navigation for managers */}
        {showManagerTopNav && isMobile && <ManagerNav />}
        <RateLimitToast />
      </Box>
      <ReadOnlyStyles />
    </>
  );
}
