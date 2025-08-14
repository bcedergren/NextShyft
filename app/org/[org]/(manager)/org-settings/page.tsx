'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Paper, Stack, TextField, Typography, Button, Skeleton } from '@mui/material';
import { useToast } from '@/components/ToastProvider';

export default function OrgSettings() {
  const { data: session } = useSession();
  const roles = ((session as any)?.roles || []) as string[];
  const isOwnerOrAdmin =
    roles.includes('OWNER') || roles.includes('ADMIN') || roles.includes('SUPERADMIN');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [suspended, setSuspended] = useState<boolean>(false);
  const [targetEmail, setTargetEmail] = useState('');
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    const r = await fetch('/api/org');
    const d = await r.json();
    setCode(d.signupCode || '');
    setName(d.name || '');
    setSuspended(Boolean(d.suspended));
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);

  const rotate = async () => {
    await fetch('/api/org/signup-code', { method: 'POST' });
    load();
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  const save = async () => {
    await fetch('/api/org', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    load();
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Organization</Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
            gap: 2,
            alignItems: 'center',
            width: '100%',
          }}
        >
          {loading ? (
            <>
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ width: '60%', animationDelay: '0.05s' }}
              />
              <Skeleton
                variant="rectangular"
                height={36}
                sx={{ width: '40%', animationDelay: '0.1s' }}
              />
              <Skeleton
                variant="rectangular"
                height={40}
                sx={{ width: '70%', animationDelay: '0.15s' }}
              />
              <Skeleton
                variant="rectangular"
                height={36}
                sx={{ width: '50%', animationDelay: '0.2s' }}
              />
              <Skeleton
                variant="rectangular"
                height={36}
                sx={{ width: '45%', animationDelay: '0.25s' }}
              />
            </>
          ) : (
            <>
              {isOwnerOrAdmin && (
                <>
                  <TextField
                    label="Org Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Button onClick={save} variant="contained">
                    Save
                  </Button>
                </>
              )}
              <TextField label="Signup Code" value={code} InputProps={{ readOnly: true }} />
              <Button onClick={rotate} variant="outlined">
                Rotate code
              </Button>
              <Button onClick={copy} variant="text">
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </>
          )}
        </Paper>
        <Typography variant="body2" color="text.secondary">
          Share the signup code with staff so they can self-join via /join.
        </Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
            gap: 2,
            width: '100%',
          }}
        >
          <TextField
            label="Send signup code to"
            type="email"
            value={targetEmail}
            onChange={(e) => setTargetEmail(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={async () => {
              if (!targetEmail) return;
              const r = await fetch('/api/org/signup-code/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail }),
              });
              if (r.ok) {
                toast('Email sent', 'success');
                setTargetEmail('');
              } else {
                const d = await r.json().catch(() => ({}));
                toast(d.error || 'Failed to send email', 'error');
              }
            }}
          >
            Email code
          </Button>
        </Paper>

        {isOwnerOrAdmin && suspended && (
          <div className="mt-4">
            <button
              onClick={async () => {
                await fetch('/api/org/suspend', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ suspended: false }),
                });
                location.reload();
              }}
              className="underline text-sm"
            >
              I’m the owner — Unsuspend org
            </button>
          </div>
        )}
      </Stack>
    </AppShell>
  );
}
