
'use client';
import { useEffect, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';

export default function ReadonlyBypassToggle() {
  const [roles, setRoles] = useState<string[]>([]);
  const [on, setOn] = useState<boolean>(false);
  useEffect(()=>{
    fetch('/api/me/roles').then(r=>r.json()).then(d=>setRoles(d.roles||[]));
    const v = localStorage.getItem('readonlyBypass') === '1';
    setOn(v);
  },[]);
  if (!(roles.includes('SUPERADMIN') || roles.includes('ADMIN'))) return null;
  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem('readonlyBypass', next ? '1' : '0');
    // Also clear/read body flag to immediately re-enable interactions
    if (next) document.body && (document.body.dataset.readonly = 'false');
  };
  return (
    <Tooltip title={on ? 'Bypass read-only (ON)' : 'Bypass read-only (OFF)'}>
      <Chip size="small" variant={on?'filled':'outlined'} label={on?'Bypass ON':'Bypass OFF'} onClick={toggle} />
    </Tooltip>
  );
}
