
'use client';
import { Alert } from '@mui/material';
import { useEffect, useState } from 'react';

export default function SuspendedBanner() {
  const [s, setS] = useState<any>(null);
  useEffect(()=>{ fetch('/api/org/status', { cache:'no-store' }).then(r=>r.json()).then(setS).catch(()=>{}); },[]);
  if (!s?.suspended) return null;
  return (
    <Alert severity="error" sx={{ borderRadius: 0 }}>
      This organization is <strong>suspended</strong>. Most actions are disabled. Please contact support or update billing to restore access.
    </Alert>
  );
}
