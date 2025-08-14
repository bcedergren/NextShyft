'use client';
import { IconButton, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import SettingsIcon from '@mui/icons-material/Settings';

export default function ManagerSettingsMenu() {
  const { data: session } = useSession();
  const orgId = (session as any)?.orgId || 'demo';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  return (
    <>
      <IconButton
        color="inherit"
        size="small"
        aria-label="Settings"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ ml: 1 }}
      >
        <SettingsIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem component={Link} href={`/org/${orgId}/audit`} onClick={() => setAnchorEl(null)}>
          Audit
        </MenuItem>
        <MenuItem component={Link} href={`/org/${orgId}/billing`} onClick={() => setAnchorEl(null)}>
          Billing
        </MenuItem>
      </Menu>
    </>
  );
}
