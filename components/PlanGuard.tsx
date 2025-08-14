'use client';
import { Alert, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function PlanGuard() {
  const [info, setInfo] = useState<any>(null);
  useEffect(() => {
    fetch('/api/org/limits')
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => {});
  }, []);
  if (!info) return null;

  const upgrade = async (plan?: string) => {
    const r = await fetch('/api/billing/checkout' + (plan ? '?plan=' + plan : ''), {
      method: 'POST',
    });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
  };

  const label = info.plan === 'pro' ? 'Upgrade to Business' : 'Upgrade Plan';
  const showSoft = info.softCap && !info.atLimit;
  if (!showSoft && !info.atLimit) return null;

  return (
    <Stack spacing={1}>
      <Alert
        severity={info.atLimit ? 'warning' : 'info'}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => upgrade(info.plan === 'pro' ? 'business' : 'pro')}
          >
            {label}
          </Button>
        }
      >
        {info.atLimit ? (
          <>You’re at your staff limit. Upgrade your plan to add more team members.</>
        ) : (
          <>You’re nearing your staff limit. Consider upgrading before you hit the cap.</>
        )}
      </Alert>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.round((info.pct || 0) * 100))}
      />
      <Typography variant="caption" color="text.secondary">
        {Math.round((info.pct || 0) * 100)}% of limit used • Current plan: {info.plan}
      </Typography>
    </Stack>
  );
}
