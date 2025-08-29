'use client';
import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PeopleIcon from '@mui/icons-material/People';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import NotifBell from '@/components/NotifBell';

export default function EmployeeTopNav() {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  const orgId = (session as any)?.orgId || 'demo';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: `/org/${orgId}/dashboard`,
      icon: <HomeIcon />,
    },
    {
      id: 'schedule',
      label: 'Schedule',
      path: `/org/${orgId}/myschedule`,
      icon: <ViewWeekIcon />,
    },
    {
      id: 'availability',
      label: 'Availability',
      path: `/org/${orgId}/availability`,
      icon: <PeopleIcon />,
    },
  ];

  const isActive = (itemPath: string) => {
    return (path || '').startsWith(itemPath);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleSignOut = () => {
    handleProfileMenuClose();
    signOut({ callbackUrl: '/signin' });
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      {/* Spacer to push navigation to the right */}
      <Box sx={{ flexGrow: 1 }} />

      {/* Navigation Items */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
        {navItems.map((item) => (
          <Button
            key={item.id}
            color="inherit"
            size="small"
            onClick={() => router.push(item.path)}
            startIcon={item.icon}
            sx={{
              textTransform: 'none',
              opacity: isActive(item.path) ? 1 : 0.85,
              fontWeight: isActive(item.path) ? 600 : 400,
              color: isActive(item.path) ? '#1f2937' : '#6b7280',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.04)',
              },
              '&:focus': {
                outline: 'none',
                boxShadow: 'none',
              },
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>

      {/* Right side items */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Notification Bell */}
        <NotifBell />

        {/* Profile Menu */}
        <IconButton
          color="inherit"
          size="small"
          onClick={handleProfileMenuOpen}
          sx={{
            color: '#6b7280',
            '&:focus': {
              outline: 'none',
              boxShadow: 'none',
            },
          }}
        >
          <AccountCircleIcon />
        </IconButton>

        <Menu
          anchorEl={profileMenuAnchor}
          open={Boolean(profileMenuAnchor)}
          onClose={handleProfileMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem
            onClick={() => {
              router.push(`/org/${orgId}/profile`);
              handleProfileMenuClose();
            }}
          >
            Profile
          </MenuItem>
          <MenuItem onClick={handleSignOut}>
            <LogoutIcon sx={{ mr: 1, fontSize: 'small' }} />
            Sign Out
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
