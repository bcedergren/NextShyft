'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';

type Item = {
  _id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export default function NotificationsModal({
  open,
  onClose,
  selectedId,
}: {
  open: boolean;
  onClose: () => void;
  selectedId?: string;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const load = async () => {
    if (isDemo) return; // disable in demo mode
    setLoading(true);
    try {
      const list = await (await fetch('/api/notifications', { cache: 'no-store' })).json();
      setItems(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const hasDemo = typeof document !== 'undefined' && /__demosession=/.test(document.cookie);
      setIsDemo(!!hasDemo);
    } catch {}
    if (open && !isDemo) load();
  }, [open, isDemo]);

  const markAll = async () => {
    if (isDemo) return;
    await fetch('/api/notifications', { method: 'PUT' });
    load();
  };

  const selected = useMemo(() => items.find((x) => x._id === selectedId), [items, selectedId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Inbox</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button onClick={markAll} size="small" disabled={loading || isDemo}>
              Mark all as read
            </Button>
            <Button onClick={load} size="small" disabled={loading || isDemo}>
              Refresh
            </Button>
          </Stack>
          {isDemo && (
            <Typography variant="body2" color="text.secondary">
              Notifications are disabled in demo mode.
            </Typography>
          )}
          {selected ? (
            <Stack spacing={1}>
              <Typography variant="subtitle1">{selected.title}</Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(selected.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {selected.body}
              </Typography>
            </Stack>
          ) : null}
          <List>
            {items.map((x) => (
              <ListItemButton
                key={x._id}
                selected={x._id === selectedId}
                href={`?inbox=1&id=${encodeURIComponent(x._id)}`}
              >
                <ListItemText
                  primary={x.title}
                  secondary={new Date(x.createdAt).toLocaleString()}
                  primaryTypographyProps={{ variant: 'body1' }}
                  secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                />
              </ListItemButton>
            ))}
            {items.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                {isDemo ? 'Notifications are disabled in demo mode.' : 'No notifications'}
              </Typography>
            )}
          </List>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
