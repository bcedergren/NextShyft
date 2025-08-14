'use client';
import { Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function SeatBadge() {
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
  const txt = `${Math.round((info.pct || 0) * 100)}%`;
  return (
    <Tooltip title={`Seats used: ${info.count}/${info.limit} • Plan: ${info.plan}`}>
      <Typography variant="body2" sx={{ mx: 1, opacity: 0.85 }}>
        {txt}
      </Typography>
    </Tooltip>
  );
}
