'use client';
import AppShell from '@/components/AppShell';
// Top navigation is now provided by AppShell
import { useSession } from 'next-auth/react';
import {
  Paper,
  Stack,
  TextField,
  Typography,
  Button,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useEffect, useState } from 'react';

export default function Profile() {
  const { data: session } = useSession();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [phone, setPhone] = useState<string>('');
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [verifCode, setVerifCode] = useState<string>('');
  const [sendingCode, setSendingCode] = useState<boolean>(false);
  const [confirming, setConfirming] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/me/profile', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setName(data.name || (session as any)?.user?.name || '');
        setEmail(data.email || (session as any)?.user?.email || '');
        setPhone(data.phone || '');
        setPhoneVerified(Boolean(data.phoneVerified));
      } else {
        setName((session as any)?.user?.name || '');
        setEmail((session as any)?.user?.email || '');
      }
    })();
  }, [session]);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Profile</Typography>
        <Paper sx={{ p: 2, width: '100%' }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label={`Phone${phoneVerified ? ' (verified)' : ''}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            sx={{ mb: 1 }}
          />
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <Button
              size="small"
              disabled={sendingCode || !phone || phoneVerified}
              onClick={async () => {
                setSendingCode(true);
                try {
                  const res = await fetch('/api/me/phone/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ phone }),
                  });
                  if (!res.ok) {
                    const d = await res.json();
                    alert(d.error || 'Failed to send code');
                  } else {
                    alert('Verification code sent');
                  }
                } finally {
                  setSendingCode(false);
                }
              }}
            >
              Send code
            </Button>
            <TextField
              label="Code"
              size="small"
              value={verifCode}
              onChange={(e) => setVerifCode(e.target.value)}
              sx={{ width: 140 }}
              disabled={phoneVerified}
            />
            <Button
              size="small"
              disabled={confirming || !verifCode || phoneVerified}
              onClick={async () => {
                setConfirming(true);
                try {
                  const res = await fetch('/api/me/phone/confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: verifCode }),
                  });
                  const d = await res.json();
                  if (!res.ok || !d.ok) alert(d.error || 'Verification failed');
                  else {
                    setPhoneVerified(true);
                    alert('Phone verified');
                  }
                } finally {
                  setConfirming(false);
                }
              }}
            >
              Confirm
            </Button>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch('/api/me/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, phone }),
                  });
                  const data = await res.json();
                  if (!res.ok) alert(data.error || 'Failed to save');
                  else if (data.reauth) {
                    // Email change: sign out to refresh session
                    window.location.href = '/signin';
                  }
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </Stack>
        </Paper>
        <Paper sx={{ p: 2, width: '100%' }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Notifications
          </Typography>
          <NotificationPrefs />
        </Paper>
      </Stack>
      {/* Bottom navigation removed; now using top tabs in AppShell */}
    </AppShell>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

function NotificationPrefs() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [loading, setLoading] = useState(true);
  const [inApp, setInApp] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [reminders, setReminders] = useState(false);
  const [reminderHours, setReminderHours] = useState<number>(1);
  const [pushSupported, setPushSupported] = useState<boolean>(false);
  const [pushEnabled, setPushEnabled] = useState<boolean>(false);
  const [pushBusy, setPushBusy] = useState<boolean>(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/me/notifications', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (alive) {
            setInApp(Boolean(data.inApp));
            setEmail(Boolean(data.email));
            setSms(Boolean(data.sms));
            setReminders(Boolean(data.shiftReminderEnabled));
            setReminderHours(Number(data.shiftReminderHours || 1));
          }
        }
        if (typeof window !== 'undefined') {
          const supported = 'serviceWorker' in navigator && 'PushManager' in window;
          if (alive) setPushSupported(supported);
          if (supported) {
            const reg = await navigator.serviceWorker.getRegistration();
            const sub = await reg?.pushManager.getSubscription();
            if (alive) setPushEnabled(!!sub);
          }
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const update = async (next: {
    inApp?: boolean;
    email?: boolean;
    sms?: boolean;
    shiftReminderEnabled?: boolean;
    shiftReminderHours?: number;
  }) => {
    const body = {
      inApp,
      email,
      sms,
      shiftReminderEnabled: reminders,
      shiftReminderHours: reminderHours,
      ...next,
    };
    setInApp(body.inApp!);
    setEmail(body.email!);
    setSms(!!body.sms);
    setReminders(!!body.shiftReminderEnabled);
    setReminderHours(Number(body.shiftReminderHours || 1));
    await fetch('/api/me/notifications', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  };

  const togglePush = async (next: boolean) => {
    if (!pushSupported) return;
    setPushBusy(true);
    try {
      if (next) {
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setPushEnabled(false);
          return;
        }
        const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as any as string;
        if (!vapid) {
          alert('Push not configured');
          setPushEnabled(false);
          return;
        }
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid),
        });
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        });
        setPushEnabled(true);
      } else {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        await sub?.unsubscribe();
        setPushEnabled(false);
      }
    } finally {
      setPushBusy(false);
    }
  };

  if (loading) return null;

  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={2}
        alignItems={isMobile ? 'stretch' : 'center'}
        sx={{
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          overflowX: isMobile ? 'visible' : 'auto',
          overflowY: 'visible',
          py: isMobile ? 0.5 : 1.5,
        }}
      >
        <FormControlLabel
          sx={{
            flex: isMobile ? '1 1 auto' : '0 0 auto',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
          }}
          control={<Switch checked={inApp} onChange={(_, v) => update({ inApp: v })} />}
          label="In-app notifications"
        />
        <FormControlLabel
          sx={{
            flex: isMobile ? '1 1 auto' : '0 0 auto',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
          }}
          control={<Switch checked={email} onChange={(_, v) => update({ email: v })} />}
          label="Email notifications"
        />
        <FormControlLabel
          sx={{
            flex: isMobile ? '1 1 auto' : '0 0 auto',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
          }}
          control={<Switch checked={sms} onChange={(_, v) => update({ sms: v })} />}
          label="SMS notifications"
        />
        <FormControlLabel
          sx={{
            flex: isMobile ? '1 1 auto' : '0 0 auto',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
          }}
          control={
            <Switch
              checked={pushEnabled}
              disabled={!pushSupported || pushBusy}
              onChange={(_, v) => togglePush(v)}
            />
          }
          label="Push notifications"
        />
        <FormControlLabel
          sx={{
            flex: isMobile ? '1 1 auto' : '0 0 auto',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
          }}
          control={
            <Switch checked={reminders} onChange={(_, v) => update({ shiftReminderEnabled: v })} />
          }
          label="Shift reminders"
        />
        <TextField
          label="Remind me hours before"
          type="number"
          size="small"
          sx={{
            width: isMobile ? '100%' : 360,
            minWidth: isMobile ? 'auto' : 360,
            flex: isMobile ? '1 1 auto' : '0 0 auto',
            '& .MuiInputLabel-root': { whiteSpace: 'nowrap', overflow: 'visible' },
            '& .MuiInputBase-root': { overflow: 'visible' },
            '& .MuiOutlinedInput-notchedOutline legend': { maxWidth: '100%', overflow: 'visible' },
          }}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: 1, max: 48 }}
          value={reminderHours}
          disabled={!reminders}
          onChange={(e) =>
            update({ shiftReminderHours: Math.max(1, Math.min(48, Number(e.target.value || 1))) })
          }
        />
      </Stack>
    </Stack>
  );
}
