'use client';
import AppShell from '@/components/AppShell';
// Top navigation is now provided by AppShell
import { useEffect, useState } from 'react';
import { Paper, Stack, Typography } from '@mui/material';

async function markRead(id: string) {
  await fetch('/api/announcements/read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
}

export default function EmployeeAnnouncements() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then(setItems);
  }, []);
  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Announcements</Typography>
        <Stack spacing={1}>
          {items.map(
            (a) => (
              markRead(a._id),
              (
                <Paper key={a._id} sx={{ p: 2 }}>
                  <Typography variant="subtitle1">{a.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.body}
                  </Typography>
                </Paper>
              )
            ),
          )}
          {items.length === 0 && <Typography color="text.secondary">No announcements.</Typography>}
        </Stack>
      </Stack>
      {/* Bottom navigation removed; now using top tabs in AppShell */}
    </AppShell>
  );
}
