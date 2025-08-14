'use client';
import { Chip, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';

export default function UpgradeChip() {
  const [info, setInfo] = useState<any>(null);
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/me/roles', { cache: 'no-store' });
        const d = await r.json();
        const ok = Array.isArray(d.roles) && d.roles.length > 0;
        setAuthed(ok);
        if (ok) {
          const lr = await fetch('/api/org/limits', { cache: 'no-store' });
          setInfo(await lr.json());
        }
      } catch {}
    })();
  }, []);
  if (!info) return null;
  if (!(info.atLimit || info.softCap)) return null;

  const click = async () => {
    const plan = info.plan === 'pro' ? 'business' : 'pro';
    const r = await fetch('/api/billing/checkout?plan=' + plan, { method: 'POST' });
    const d = await r.json();
    if (d.url) window.location.href = d.url;
  };

  const label = info.atLimit ? 'Upgrade' : 'Upgrade?';
  const color = info.atLimit ? 'warning' : 'default';

  return (
    <Tooltip
      title={
        info.atLimit
          ? 'You have reached your seat limit. Upgrade your plan.'
          : 'You are nearing your seat limit. Upgrade to avoid hitting the cap.'
      }
    >
      <Chip
        onClick={click}
        label={label}
        color={color as any}
        variant="outlined"
        clickable
        size="small"
      />
    </Tooltip>
  );
}
