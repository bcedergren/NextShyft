'use client';

import {
  Box,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PolicyIcon from '@mui/icons-material/Policy';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function ManagerSideNav() {
  const { data: session } = useSession();
  const orgId = (session as any)?.orgId || 'demo';
  const roles = ((session as any)?.roles || []) as string[];
  const isOwnerOrAdmin =
    roles.includes('OWNER') || roles.includes('ADMIN') || roles.includes('SUPERADMIN');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('managerSideCollapsed') === '1');
    } catch {}
  }, []);
  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem('managerSideCollapsed', next ? '1' : '0');
    } catch {}
  };
  return (
    <Box
      sx={{
        position: 'sticky',
        top: (theme) => (Number((theme.mixins.toolbar as any)?.minHeight) || 64) + 8,
        alignSelf: 'flex-start',
        width: collapsed ? 56 : { xs: 56, md: 260 },
      }}
    >
      <Paper sx={{ p: 1, minHeight: 'calc(100vh - 80px)' }}>
        <Box sx={{ display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
          <IconButton
            size="small"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? (
              <ChevronRightIcon fontSize="small" />
            ) : (
              <ChevronLeftIcon fontSize="small" />
            )}
          </IconButton>
        </Box>
        <List
          dense
          sx={{
            '& .MuiListItemIcon-root': { minWidth: 0, mr: 0, justifyContent: 'center' },
            '& .MuiListItemButton-root': {
              px: 1,
              justifyContent: collapsed ? 'center' : { xs: 'center', md: 'flex-start' },
            },
            '& .MuiListItemText-root': {
              display: collapsed ? 'none' : { xs: 'none', md: 'block' },
            },
          }}
        >
          <ListItemButton component={Link} href={`/org/${orgId}/schedule`}>
            <ListItemIcon>
              <CalendarMonthIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Schedule" />
          </ListItemButton>
          <ListItemButton component={Link} href={`/org/${orgId}/positions`}>
            <ListItemIcon>
              <WorkOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Positions" />
          </ListItemButton>
          <ListItemButton component={Link} href={`/org/${orgId}/shifts`}>
            <ListItemIcon>
              <ViewWeekIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Shifts" />
          </ListItemButton>
          <ListItemButton component={Link} href={`/org/${orgId}/coverage`}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Coverage" />
          </ListItemButton>
          <ListItemButton component={Link} href={`/org/${orgId}/policy`}>
            <ListItemIcon>
              <PolicyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Policy" />
          </ListItemButton>
          <ListItemButton component={Link} href={`/org/${orgId}/holidays`}>
            <ListItemIcon>
              <EventAvailableIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Holidays" />
          </ListItemButton>
          {isOwnerOrAdmin && (
            <ListItemButton component={Link} href={`/org/${orgId}/org-settings`}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Org Settings" />
            </ListItemButton>
          )}
        </List>
      </Paper>
    </Box>
  );
}
