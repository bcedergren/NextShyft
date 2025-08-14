
'use client';
import { Alert, LinearProgress, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

export default function LimitMeter() {
  const [info, setInfo] = useState<any>(null);
  useEffect(()=>{ fetch('/api/org/limits').then(r=>r.json()).then(setInfo).catch(()=>{}); },[]);
  if (!info) return null;
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2">Staff limit</Typography>
      <LinearProgress variant="determinate" value={Math.min(100, Math.round((info.pct||0)*100))} />
      <Typography variant="caption" color="text.secondary">{info.count} of {info.limit} seats used • Plan: {info.plan}</Typography>
      {info.atLimit && <Alert severity="warning" sx={{ mt:1 }}>You’ve reached your plan limit.</Alert>}
    </Stack>
  );
}
