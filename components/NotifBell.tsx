'use client';
import { Badge, IconButton, Menu, MenuItem, ListItemText, Divider } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import BlockIcon from '@mui/icons-material/Block';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import NotificationsModal from '@/components/NotificationsModal';

type Item = {
  _id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export default function NotifBell() {
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Item[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [isDemo, setIsDemo] = useState(false);
  const [hovered, setHovered] = useState(false);

  const load = async () => {
    if (isDemo) return; // disable notifications API in demo mode
    try {
      const [unreadRes, listRes] = await Promise.all([
        fetch('/api/notifications?unread=1', { cache: 'no-store' }),
        fetch('/api/notifications', { cache: 'no-store' }),
      ]);
      const unread = await unreadRes.json();
      const list = await listRes.json();
      setCount(unread.count || 0);
      setItems(list.slice(0, 8));
    } catch {}
  };

  useEffect(() => {
    // detect demo session via cookie
    try {
      const hasDemo = typeof document !== 'undefined' && /__demosession=/.test(document.cookie);
      setIsDemo(!!hasDemo);
    } catch {}
    (async () => {
      try {
        const r = await fetch('/api/me/roles', { cache: 'no-store' });
        const d = await r.json();
        const ok = Array.isArray(d.roles) && d.roles.length > 0;
        const hasDemoNow =
          typeof document !== 'undefined' && /__demosession=/.test(document.cookie);
        if (ok && !hasDemoNow) {
          await load();
          const t = setInterval(load, 20000);
          return () => clearInterval(t);
        }
      } catch {}
    })();
    // re-run when isDemo changes
  }, [isDemo]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const openItem = (id?: string) => {
    setSelectedId(id);
    setModalOpen(true);
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="notifications"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title={isDemo ? 'Notifications are disabled in demo mode' : undefined}
      >
        <Badge badgeContent={count} color="primary">
          {isDemo && hovered ? <BlockIcon color="error" /> : <NotificationsIcon />}
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{ paper: { sx: { minWidth: 280 } } }}
      >
        {items.map((x, idx) => (
          <MenuItem
            key={x._id}
            onClick={() => {
              handleClose();
              openItem(x._id);
            }}
            sx={{ alignItems: 'start', whiteSpace: 'normal' }}
          >
            <ListItemText
              primary={x.title}
              secondary={new Date(x.createdAt).toLocaleString()}
              primaryTypographyProps={{ variant: 'body1' }}
              secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
            />
          </MenuItem>
        ))}
        {items.length === 0 && (
          <MenuItem disabled>
            <ListItemText
              primary="No notifications"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </MenuItem>
        )}
        <Divider />
        <MenuItem
          onClick={() => {
            handleClose();
            openItem(undefined);
          }}
        >
          <ListItemText primary="Open Inbox" />
        </MenuItem>
      </Menu>
      <NotificationsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        selectedId={selectedId}
      />
    </>
  );
}
