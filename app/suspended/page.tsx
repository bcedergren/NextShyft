
'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';

export default function SuspendedPage() {
  const [st, setSt] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [msg, setMsg] = useState<string>('');

  useEffect(()=>{
    fetch('/api/org/status', { cache:'no-store' }).then(r=>r.json()).then(setSt);
    fetch('/api/me/roles').then(r=>r.json()).then(d=>setRoles(d.roles||[]));
  },[]);

  const isOwner = roles.includes('OWNER') || roles.includes('ADMIN') || roles.includes('SUPERADMIN');

  const unsuspend = async () => {
    setMsg('');
    const r = await fetch('/api/org/suspend', { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ suspended: false }) });
    const d = await r.json();
    if (r.ok) { setMsg('Org unsuspended. Reloading...'); setTimeout(()=>location.assign('/'), 800); }
    else setMsg(d.error || 'Error');
  };

  const escalate = async () => {
    setMsg('');
    const r = await fetch('/api/support/escalate', { method:'POST' });
    const d = await r.json();
    if (r.ok) setMsg('Support notified — we’ll be in touch.');
    else setMsg(d.error || 'Error');
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Organization Suspended</Typography>
        <Paper sx={{ p:2 }}>
          <Typography>Access is temporarily restricted for this organization.</Typography>
          <Typography color="text.secondary" sx={{ mt:1 }}>Plan: {st?.plan} {st?.suspendedAt ? `• since ${new Date(st.suspendedAt).toLocaleString()}` : ''}</Typography>
          <Stack direction="row" spacing={2} sx={{ mt:2 }}>
            <Button href="/org/demo/(manager)/billing" variant="contained">Go to Billing</Button>
            <Button onClick={escalate} variant="outlined">Contact Support</Button>
            {isOwner && <Button onClick={unsuspend} variant="outlined">I’m the owner — Unsuspend</Button>}
          </Stack>
          {msg && <Alert sx={{ mt:2 }} severity={msg.includes('unsuspended') ? 'success' : 'info'}>{msg}</Alert>}
        </Paper>
      </Stack>
    </AppShell>
  );
}
