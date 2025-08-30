'use client';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import SuspendedBanner from '@/components/SuspendedBanner';
import SuspendedGate from '@/components/SuspendedGate';
import ReadOnlyStyles from '@/components/ReadOnlyStyles';
import ManagerSideNav from '@/components/ManagerSideNav';
import ManagerNav from '@/components/ManagerNav';
import RateLimitToast from '@/components/RateLimitToast';
import EmployeeTopNav from '@/components/EmployeeTopNav';
import ManagerTopNav from '@/components/ManagerTopNav';
import OwnerTopNav from '@/components/OwnerTopNav';
import AdminTopNav from '@/components/AdminTopNav';
import UpgradeChip from '@/components/UpgradeChip';
import ReadonlyBypassToggle from '@/components/ReadonlyBypassToggle';
import ManagerSettingsMenu from '@/components/ManagerSettingsMenu';
import { Alert } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import MenuIcon from '@mui/icons-material/Menu';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import HomeIcon from '@mui/icons-material/Home';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CampaignIcon from '@mui/icons-material/Campaign';
// import LogoutIcon from '@mui/icons-material/Logout';

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

function DemoSignupBar() {
  const [info, setInfo] = useState<{ orgId: string; claimToken: string } | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/demo/info', { cache: 'no-store' });
        if (!res.ok) return;
        const d = await res.json();
        if (alive && d?.ok) setInfo({ orgId: d.orgId, claimToken: d.claimToken });
      } catch {}
    })();
    (async () => {
      try {
        const r = await fetch('/api/me/roles', { cache: 'no-store' });
        if (!r.ok) return;
        const d = await r.json();
        if (alive && Array.isArray(d.roles)) setRoles(d.roles);
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);
  if (!info) return null;
  const href = `/signup?importDemo=1&orgId=${encodeURIComponent(info.orgId)}&claimToken=${encodeURIComponent(info.claimToken)}`;
  const rolePriority = ['ADMIN', 'SUPERADMIN', 'OWNER', 'MANAGER', 'EMPLOYEE'];
  const upper = roles.map((r: string) => String(r).toUpperCase());
  const primary = rolePriority.find((r) => upper.includes(r)) || upper[0] || '';
  const pretty = primary
    ? primary === 'SUPERADMIN'
      ? 'Admin'
      : primary.charAt(0) + primary.slice(1).toLowerCase()
    : '';
  return (
    <Alert
      severity="info"
      sx={{ borderRadius: 0 }}
      action={
        <Button href={href} variant="contained" size="small" color="info">
          Import demo data & sign up
        </Button>
      }
    >
      You’re viewing a demo{pretty ? ` as ` : ''}
      {pretty ? <strong>{pretty}</strong> : null}. Keep your work by importing this demo data into a
      new account.
    </Alert>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [roles, setRoles] = useState<string[]>([]);
  const [orgName, setOrgName] = useState<string>('');
  const prevTitleRef = useRef<string | null>(null);
  const path = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const authed = status === 'authenticated' || (status !== 'loading' && roles.length > 0);
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

  // Fallback: if not authenticated and server roles haven’t populated yet,
  // read roles from the demo mock cookie so the top navbar matches the selected demo role.
  useEffect(() => {
    if (roles.length > 0) return; // already have roles
    if (status === 'loading') return;
    try {
      const m = (typeof document !== 'undefined' ? document.cookie : '').match(
        /__mocksession=([^;]+)/,
      );
      if (!m) return;
      const mock = JSON.parse(decodeURIComponent(m[1]));
      const list = Array.isArray(mock?.roles) ? mock.roles : [];
      if (list.length > 0) setRoles(list);
    } catch {}
  }, [roles.length, status]);

  // Hide browser print header (which shows document.title) to avoid duplicate "NextShyft" on print
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleBeforePrint = () => {
      if (prevTitleRef.current === null) {
        prevTitleRef.current = document.title;
        document.title = ' ';
      }
    };
    const handleAfterPrint = () => {
      if (prevTitleRef.current !== null) {
        document.title = prevTitleRef.current;
        prevTitleRef.current = null;
      }
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    const media = window.matchMedia ? window.matchMedia('print') : null;
    const mediaListener = (e: MediaQueryListEvent) => {
      if (e.matches) handleBeforePrint();
      else handleAfterPrint();
    };
    if (media) {
      // Support both modern and older browsers
      if ('addEventListener' in media) media.addEventListener('change', mediaListener);
      // @ts-ignore deprecated API
      else if ('addListener' in media) media.addListener(mediaListener);
    }
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      if (media) {
        if ('removeEventListener' in media) media.removeEventListener('change', mediaListener);
        // @ts-ignore deprecated API
        else if ('removeListener' in media) media.removeListener(mediaListener);
      }
    };
  }, []);

  // Load organization name for the current session (if authenticated), but never on /signup
  useEffect(() => {
    let alive = true;
    if (!authed || onSignupPage) {
      setOrgName('');
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/org', { cache: 'no-store' });
        if (!res.ok) return;
        const org = await res.json();
        if (alive) setOrgName(org?.name || '');
      } catch {
        if (alive) setOrgName('');
      }
    })();
    return () => {
      alive = false;
    };
  }, [authed]);
  const sessionRoles = ((session as any)?.roles || []) as string[];
  const effectiveRoles = (roles.length > 0 ? roles : sessionRoles).map((r) =>
    String(r).toUpperCase(),
  );
  const isManager = ['MANAGER', 'OWNER', 'ADMIN', 'SUPERADMIN'].some((r) =>
    effectiveRoles.includes(r),
  );

  // Determine user role for navigation
  const isEmployee = effectiveRoles.includes('EMPLOYEE') && !isManager;
  const isManagerRole =
    effectiveRoles.includes('MANAGER') &&
    !effectiveRoles.includes('OWNER') &&
    !effectiveRoles.includes('ADMIN');
  const isOwner = effectiveRoles.includes('OWNER') && !effectiveRoles.includes('ADMIN');
  const isAdmin = effectiveRoles.includes('ADMIN') || effectiveRoles.includes('SUPERADMIN');
  const orgIdFromPath = (() => {
    const m = (path || '').match(/^\/org\/([^\/]+)/);
    return m?.[1] || null;
  })();
  const orgId = orgIdFromPath || (session as any)?.orgId || 'demo';
  const onSchedulePage = (path || '').startsWith(`/org/${orgId}/schedule`);
  const isCoveragePage = (path || '').startsWith(`/org/${orgId}/coverage`);
  const isSchedulePage = (path || '').startsWith(`/org/${orgId}/schedule`);
  const isShiftsPage = (path || '').startsWith(`/org/${orgId}/shifts`);
  const isPositionsPage = (path || '').startsWith(`/org/${orgId}/positions`);
  const onSignupPage = (path || '').startsWith('/signup');
  const onSigninPage = (path || '').startsWith('/signin');
  const onForgotPage = (path || '').startsWith('/forgot');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const managerSideNavRoutes = new RegExp(
    `^/org/${orgId}/(positions|shifts|coverage|policy|holidays|org-settings)`,
  );
  const showManagerSideNav =
    !isEmployee && (managerSideNavRoutes.test(path || '') || onSchedulePage);

  return (
    <>
      <Box>
        {/* Demo-only signup/retain-data bar above the navbar (hidden on auth pages) */}
        {!onSignupPage && !onSigninPage && !onForgotPage && (
          <Box sx={{ '@media print': { display: 'none' } }}>
            <DemoSignupBar />
          </Box>
        )}
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', color: '#1f2937' }}>
          <Toolbar sx={{ gap: 1, px: 1, position: 'relative', flexWrap: 'wrap' }}>
            {/* Logo + Company name (responsive: stacked on mobile, inline on larger screens) */}
            <Box
              sx={{
                mr: { xs: 2, md: 2 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                minWidth: 0,
                flexShrink: 0,
              }}
            >
              <Typography
                variant="h5"
                sx={{ color: 'inherit', lineHeight: 1, mt: { xs: 0.75, sm: 1 } }}
              >
                NextShyft
              </Typography>
              {authed && !!orgName && !onSignupPage && !onSigninPage && !onForgotPage && (
                <Typography
                  noWrap={false}
                  variant="subtitle1"
                  sx={{
                    color: '#6b7280',
                    fontWeight: 400,
                    mt: { xs: 0.75, sm: 1 },
                    // Add more space between the logo and name on larger screens
                    ml: { xs: 0, sm: 8, md: 10 },
                    minWidth: 0,
                    // Allow wrapping (no truncation) at all sizes
                    maxWidth: { xs: '100%', sm: 'none' },
                    whiteSpace: 'normal',
                    overflow: 'visible',
                    textOverflow: 'clip',
                    wordBreak: 'break-word',
                    flexShrink: 0,
                  }}
                  title={orgName}
                >
                  {orgName}
                </Typography>
              )}
            </Box>

            {/* Spacer to push nav/actions to the right, preserving room for the name */}
            <Box sx={{ flex: 1 }} />

            {/* Role-based navigation */}
            {authed && !onSignupPage && !onSigninPage && !onForgotPage && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: { xs: 0, sm: -0.5 },
                  '@media print': { display: 'none' },
                }}
              >
                {isEmployee && <EmployeeTopNav />}
                {isManagerRole && <ManagerTopNav />}
                {isOwner && <OwnerTopNav />}
                {isAdmin && <AdminTopNav />}
              </Box>
            )}

            {/* Fallback for unauthenticated users */}
            {!authed &&
              !path?.startsWith('/signin') &&
              !path?.startsWith('/signup') &&
              !path?.startsWith('/forgot') && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    ml: 'auto',
                    '@media print': { display: 'none' },
                  }}
                >
                  <Button href="/signin" variant="contained" size="small">
                    Sign In
                  </Button>
                </Box>
              )}

            {/* Additional components for authenticated users */}
            {authed && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  mt: { xs: 0, sm: -0.5 },
                  '@media print': { display: 'none' },
                }}
              >
                <ReadonlyBypassToggle />
                <UpgradeChip />
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
              </Box>
            )}
          </Toolbar>
        </AppBar>

        <Drawer
          sx={{ '@media print': { display: 'none' } }}
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
              {/* Employee Mobile Navigation */}
              {isEmployee && (
                <>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/dashboard`)}>
                    <ListItemIcon>
                      <HomeIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/myschedule`)}>
                    <ListItemIcon>
                      <ViewWeekIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Schedule" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/availability`)}>
                    <ListItemIcon>
                      <PeopleIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Availability" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                </>
              )}

              {/* Manager Mobile Navigation */}
              {isManagerRole && (
                <>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/dashboard`)}>
                    <ListItemIcon>
                      <HomeIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/schedule`)}>
                    <ListItemIcon>
                      <ViewWeekIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Schedule" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/people`)}>
                    <ListItemIcon>
                      <PeopleIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="People" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/swaps`)}>
                    <ListItemIcon>
                      <SwapHorizIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Swaps" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/announcements`)}>
                    <ListItemIcon>
                      <CampaignIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Announcements" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                </>
              )}

              {/* Owner Mobile Navigation */}
              {isOwner && (
                <>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/dashboard`)}>
                    <ListItemIcon>
                      <HomeIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/schedule`)}>
                    <ListItemIcon>
                      <ViewWeekIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Schedule" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/people`)}>
                    <ListItemIcon>
                      <PeopleIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="People" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/reports`)}>
                    <ListItemIcon>
                      <AnalyticsIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Reports" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/announcements`)}>
                    <ListItemIcon>
                      <CampaignIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Announcements" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                </>
              )}

              {/* Admin Mobile Navigation */}
              {isAdmin && (
                <>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/dashboard`)}>
                    <ListItemIcon>
                      <HomeIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/accounts`)}>
                    <ListItemIcon>
                      <CreditCardIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Accounts" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                  <ListItemButton onClick={() => router.push(`/org/${orgId}/reports`)}>
                    <ListItemIcon>
                      <AnalyticsIcon sx={{ color: '#6b7280' }} />
                    </ListItemIcon>
                    <ListItemText primary="Reports" sx={{ color: '#1f2937' }} />
                  </ListItemButton>
                </>
              )}
            </List>
            <Box sx={{ flexGrow: 1 }} />
          </Box>
        </Drawer>

        <Box sx={{ '@media print': { display: 'none' } }}>
          <SuspendedBanner />
          <SuspendedGate />
          <PinnedAnnouncement />
        </Box>

        <Container
          disableGutters
          sx={{
            py: 2,
            px: isSchedulePage ? 0 : 1,
            pb: { xs: 8, md: 2 },
            '@media print': { py: 0, px: 0, pb: 0 },
          }}
          maxWidth={
            isCoveragePage || isSchedulePage || isShiftsPage || isPositionsPage ? false : 'xl'
          }
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              // On Schedule page, use a precise 1px left margin on content instead of flex gap
              gap: isSchedulePage ? 0 : 2,
            }}
          >
            <Box sx={{ '@media print': { display: 'none' } }}>
              {showManagerSideNav && <ManagerSideNav />}
            </Box>
            <Box sx={{ flex: 1, width: '100%', ml: isSchedulePage ? '10px' : 0 }}>{children}</Box>
          </Box>
        </Container>

        {/* Mobile bottom navigation for managers */}
        <Box sx={{ '@media print': { display: 'none' } }}>
          {(isManagerRole || isOwner) && isMobile && <ManagerNav />}
        </Box>
        <Box sx={{ '@media print': { display: 'none' } }}>
          <RateLimitToast />
        </Box>
      </Box>
      <ReadOnlyStyles />
    </>
  );
}
