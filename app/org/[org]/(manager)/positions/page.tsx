'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { Button, Paper, Stack, TextField, Typography, Skeleton } from '@mui/material';

export default function PositionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await (await fetch('/api/positions')).json());
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    await fetch('/api/positions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setName('');
    load();
  };

  const startEdit = (p: any) => {
    setEditing(p._id);
    setEditName(p.name);
  };
  const saveEdit = async (id: string) => {
    await fetch(`/api/positions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    });
    setEditing(null);
    setEditName('');
    load();
  };
  const cancelEdit = () => {
    setEditing(null);
    setEditName('');
  };
  const remove = async (id: string) => {
    const r = await fetch(`/api/positions/${id}`, { method: 'DELETE' });
    if (!r.ok) {
      const j = await r.json();
      alert(j.error || 'Unable to delete');
    }
    load();
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Positions</Typography>
        <Paper sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Position name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button variant="contained" onClick={add}>
            Add
          </Button>
        </Paper>
        <Paper sx={{ p: 2 }}>
          {loading ? (
            <Stack spacing={1}>
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="rectangular" height={36} />
              <Skeleton variant="rectangular" height={36} />
            </Stack>
          ) : (
            items.map((p) => (
              <Stack
                key={p._id}
                direction="row"
                spacing={2}
                sx={{
                  py: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  alignItems: 'center',
                }}
              >
                {editing === p._id ? (
                  <>
                    <TextField
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <Button onClick={() => saveEdit(p._id)} variant="contained">
                      Save
                    </Button>
                    <Button onClick={cancelEdit}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Typography flex={1}>{p.name}</Typography>
                    <Button size="small" onClick={() => startEdit(p)}>
                      Rename
                    </Button>
                    <Button size="small" color="error" onClick={() => remove(p._id)}>
                      Delete
                    </Button>
                  </>
                )}
              </Stack>
            ))
          )}
        </Paper>
      </Stack>
    </AppShell>
  );
}
