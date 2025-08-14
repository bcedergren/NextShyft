'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useToast } from '@/components/ToastProvider';

export default function ManagerAnnouncements() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', body: '', pinned: false });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; body: string; pinned: boolean }>({
    title: '',
    body: '',
    pinned: false,
  });
  const toast = useToast();

  const load = async () => setItems(await (await fetch('/api/announcements')).json());
  useEffect(() => {
    load();
  }, []);

  const createOne = async () => {
    await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ title: '', body: '', pinned: false });
    load();
    toast('Announcement posted', 'success');
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
    load();
    toast('Announcement deleted', 'success');
  };

  const startEdit = (a: any) => {
    setEditingId(a._id);
    setEditForm({ title: a.title || '', body: a.body || '', pinned: !!a.pinned });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await fetch(`/api/announcements/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editForm),
    });
    setEditingId(null);
    load();
    toast('Announcement updated', 'success');
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Announcements</Typography>
        <Paper sx={{ p: 2, display: 'grid', gridTemplateColumns: '1fr', gap: 2 }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <TextField
            label="Body"
            multiline
            rows={4}
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={form.pinned}
                onChange={(e) => setForm({ ...form, pinned: e.target.checked })}
              />
            }
            label="Pin to top"
          />
          <Button variant="contained" onClick={createOne}>
            Post
          </Button>
        </Paper>
        <Paper sx={{ p: 2 }}>
          {items.length === 0 && (
            <Typography color="text.secondary">No announcements yet.</Typography>
          )}
          {items.map((a) => (
            <Stack
              key={a._id}
              spacing={0.75}
              sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
            >
              {editingId === a._id ? (
                <>
                  <TextField
                    label="Title"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Body"
                    multiline
                    minRows={3}
                    value={editForm.body}
                    onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={editForm.pinned}
                        onChange={(e) => setEditForm({ ...editForm, pinned: e.target.checked })}
                      />
                    }
                    label="Pin to top"
                  />
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={saveEdit}
                    >
                      Save
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<CloseIcon />}
                      onClick={cancelEdit}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </>
              ) : (
                <>
                  <Typography variant="subtitle1">{a.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.body}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                    <IconButton aria-label="edit" size="small" onClick={() => startEdit(a)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="delete" size="small" onClick={() => remove(a._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </>
              )}
            </Stack>
          ))}
        </Paper>
      </Stack>
    </AppShell>
  );
}
