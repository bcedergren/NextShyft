'use client';

import { Box, Paper, List, ListItemButton, ListItemText, ListItemIcon, IconButton, Button, Divider, AppBar, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import QuickMenuNav from '@/components/QuickMenuNav';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LogoutIcon from '@mui/icons-material/Logout';

const INK = '#0F1B2D';
const BG = '#F7F8FB';
const BORDER = 'rgba(15, 27, 45, 0.10)';

const navItems = [
  { href: '/schedule', label: 'Schedule', icon: CalendarMonthIcon },
  { href: '/requests', label: 'Requests', icon: RequestQuoteIcon },
  { href: '/employees', label: 'Employees', icon: PeopleIcon },
  { href: '/labor', label: 'Labor', icon: TrendingUpIcon },
  { href: '/positions', label: 'Positions', icon: WorkOutlineIcon },
  { href: '/shifts', label: 'Shifts', icon: ViewWeekIcon },
  { href: '/coverage', label: 'Coverage', icon: DashboardIcon },
  { href: '/wizard', label: 'Wizard', icon: AutoFixHighIcon },
  { href: '/swaps', label: 'Swaps', icon: SwapHorizIcon },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<boolean>(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('dashboardSidebarCollapsed') === '1');
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('dashboardSidebarCollapsed', next ? '1' : '0');
    } catch {}
  };

  return (
    <Box
      sx={{
        height: '100vh',
        overflow: 'hidden',
        bgcolor: BG,
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box
        component="aside"
        sx={{
          width: collapsed ? 72 : { xs: 72, md: 240 },
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          bgcolor: '#0f172a',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflow: 'auto',
          transition: 'width 0.2s ease-in-out',
        }}
      >
        <Paper
          elevation={0}
          sx={{
            minHeight: '100%',
            borderRadius: 0,
            border: 'none',
            bgcolor: '#0f172a',
            pt: 2,
            pb: 2,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ px: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {collapsed ? (
              <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                <img
                  src="/icon.png"
                  alt="NextShyft"
                  style={{ width: '32px', height: '32px', display: 'block' }}
                />
              </Box>
            ) : (
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <img
                  src="/logo.png"
                  alt="NextShyft"
                  style={{ width: '120px', height: 'auto', display: 'block' }}
                />
              </Box>
            )}
            {!collapsed && (
              <IconButton
                size="small"
                onClick={toggleCollapsed}
                aria-label="Collapse sidebar"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: { xs: 'none', md: 'inline-flex' },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          {collapsed && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <IconButton
                size="small"
                onClick={toggleCollapsed}
                aria-label="Expand sidebar"
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.7)',
                  display: { xs: 'none', md: 'inline-flex' },
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </Box>
          )}
          <List
            dense
            sx={{
              '& .MuiListItemIcon-root': { 
                minWidth: 40, 
                color: 'rgba(255, 255, 255, 0.7)',
                justifyContent: 'center',
              },
              '& .MuiListItemButton-root': {
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                py: 1.25,
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&.active': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiListItemIcon-root': { color: '#ffffff' },
                  '& .MuiListItemText-primary': { color: '#ffffff' },
                },
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
              },
              '& .MuiListItemText-primary': {
                fontWeight: 500,
                fontSize: '0.9375rem',
                color: 'rgba(255, 255, 255, 0.85)',
              },
              '& .MuiListItemText-root': {
                display: collapsed ? 'none' : { xs: 'none', md: 'block' },
              },
            }}
          >
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== '/schedule' && pathname?.startsWith(href));
              return (
                <ListItemButton
                  key={href}
                  component={Link}
                  href={href}
                  className={active ? 'active' : ''}
                >
                  <ListItemIcon>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={label} sx={{ display: { xs: 'none', md: 'block' } }} />
                </ListItemButton>
              );
            })}
          </List>
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Box sx={{ px: 1, pb: 1 }}>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)', mb: 1 }} />
            <ListItemButton
              onClick={() => signOut({ callbackUrl: '/signin' })}
              sx={{
                borderRadius: 1,
                py: 1.25,
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40, 
                color: 'rgba(255, 255, 255, 0.7)',
                justifyContent: 'center',
              }}>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="Sign Out"
                  primaryTypographyProps={{
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    color: 'rgba(255, 255, 255, 0.85)',
                  }}
                  sx={{ display: { xs: 'none', md: 'block' } }}
                />
              )}
            </ListItemButton>
          </Box>
        </Paper>
      </Box>
      <Box component="main" sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            color: '#1f2937',
            borderBottom: '1px solid #f3f4f6',
          }}
        >
          <Toolbar sx={{ gap: 1, px: 2, minHeight: { xs: 48, md: 56 } }}>
            <Box sx={{ flex: 1 }} />
            <QuickMenuNav />
          </Toolbar>
        </AppBar>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>{children}</Box>
      </Box>
    </Box>
  );
}
