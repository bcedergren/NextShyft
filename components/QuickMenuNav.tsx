'use client';

import { Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GridViewIcon from '@mui/icons-material/GridView';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PeopleIcon from '@mui/icons-material/People';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import { useState } from 'react';
import NotifBell from '@/components/NotifBell';
import ManagerSettingsMenu from '@/components/ManagerSettingsMenu';

function QuickCreateMenu({ orgId }: { orgId: string }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const handleClose = () => setAnchorEl(null);
  const navigate = (path: string) => {
    handleClose();
    router.push(path);
  };
  return (
    <>
      <Tooltip title="Quick create">
        <IconButton
          color="inherit"
          size="small"
          aria-label="Quick create"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: '#6b7280' }}
        >
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => navigate(`/org/${orgId}/schedule`)}>
          <ViewWeekIcon fontSize="small" sx={{ mr: 1 }} />
          New schedule
        </MenuItem>
        <MenuItem onClick={() => navigate(`/org/${orgId}/people`)}>
          <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
          Invite person
        </MenuItem>
        <MenuItem onClick={() => navigate(`/org/${orgId}/wizard`)}>
          <AutoFixHighIcon fontSize="small" sx={{ mr: 1 }} />
          Setup wizard
        </MenuItem>
      </Menu>
    </>
  );
}

export default function QuickMenuNav() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const orgId = (session as any)?.orgId ?? 'demo';

  if (status !== 'authenticated') return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        ml: 1,
        pl: 1,
        borderLeft: '1px solid #e5e7eb',
      }}
    >
      <Tooltip title="Dashboard">
        <IconButton
          color="inherit"
          size="small"
          aria-label="Dashboard"
          onClick={() => router.push(orgId ? `/org/${orgId}/dashboard` : '/dashboard')}
          sx={{ color: '#6b7280' }}
        >
          <GridViewIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title="Help">
        <IconButton
          color="inherit"
          size="small"
          aria-label="Help"
          component="a"
          href="/contact"
          sx={{ color: '#6b7280' }}
        >
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <NotifBell />
      <ManagerSettingsMenu />
      <QuickCreateMenu orgId={orgId} />
    </Box>
  );
}
