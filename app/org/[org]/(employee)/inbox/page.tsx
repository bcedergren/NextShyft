'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { Button, Paper, Stack, Typography } from '@mui/material';

type Item = {
  _id: string;
  type: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export default function Inbox() {
  const [items, setItems] = useState<Item[]>([]);
  const load = async () => setItems(await (await fetch('/api/notifications')).json());
  useEffect(() => {
    load();
  }, []);
  const markAll = async () => {
    await fetch('/api/notifications', { method: 'PUT' });
    load();
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Notifications</Typography>
        <Button onClick={markAll}>Mark all as read</Button>
        <Stack spacing={1}>
          {items.map((x) => (
            <Paper key={x._id} sx={{ p: 2, opacity: x.read ? 0.7 : 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                {new Date(x.createdAt).toLocaleString()} • {x.type}
              </Typography>
              <Typography variant="body1">{x.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {x.body}
              </Typography>
            </Paper>
          ))}
          {items.length === 0 && <Typography color="text.secondary">No notifications.</Typography>}
        </Stack>
      </Stack>
      {/* Bottom navigation removed; now using top tabs in AppShell */}
    </AppShell>
  );
}
