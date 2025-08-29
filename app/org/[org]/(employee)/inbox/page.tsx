'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

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
  const load = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          console.error('API returned non-array data:', data);
          setItems([]);
        }
      } else {
        console.error('API request failed:', response.status);
        setItems([]);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setItems([]);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const markAll = async () => {
    try {
      const response = await fetch('/api/notifications', { method: 'PUT' });
      if (response.ok) {
        load();
      } else {
        console.error('Failed to mark all as read:', response.status);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Notifications & Messages</Typography>
        <Typography variant="body2" color="text.secondary">
          Stay updated with important announcements, shift changes, and team communications.
        </Typography>
        {/* Notification Summary */}
        <Paper sx={{ p: 2, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-around">
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {items.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Notifications
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {items.filter(x => !x.read).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unread
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {items.filter(x => x.type === 'announcement').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Announcements
              </Typography>
            </Box>
          </Stack>
        </Paper>
        
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight="500">
            Recent Notifications
          </Typography>
          <Button onClick={markAll} variant="outlined" size="small">
            Mark all as read
          </Button>
        </Stack>
        
        <Stack spacing={1}>
          {items.map((x) => (
            <Paper 
              key={x._id} 
              sx={{ 
                p: 2, 
                opacity: x.read ? 0.7 : 1,
                border: x.read ? '1px solid' : '2px solid',
                borderColor: x.read ? 'divider' : 'primary.main',
                bgcolor: x.read ? 'background.paper' : 'primary.50'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {new Date(x.createdAt).toLocaleString()} • {x.type}
                  </Typography>
                  <Typography variant="body1" fontWeight={x.read ? 400 : 600}>
                    {x.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {x.body}
                  </Typography>
                </Box>
                {!x.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      flexShrink: 0,
                      mt: 1
                    }}
                  />
                )}
              </Stack>
            </Paper>
          ))}
          {items.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" variant="body1">
                No notifications yet. You're all caught up!
              </Typography>
            </Paper>
          )}
        </Stack>
      </Stack>
      {/* Bottom navigation removed; now using top tabs in AppShell */}
    </AppShell>
  );
}
