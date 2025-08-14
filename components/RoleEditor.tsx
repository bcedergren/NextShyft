
'use client';
import { useEffect, useState } from 'react';
import { Alert, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';

export default function RoleEditor() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MANAGER');
  const [op, setOp] = useState<'add'|'remove'|'set'>('add');
  const [msg, setMsg] = useState<string>('');
  const [roles, setRoles] = useState<string[]|null>(null);
  useEffect(()=>{ fetch('/api/me/roles').then(r=>r.json()).then(d=>setRoles(d.roles||[])); },[]);

  const submit = async () => {
    setMsg('');
    const r = await fetch('/api/users/role', {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ email, role, op }),
    });
    const d = await r.json().catch(()=>({}));
    if (r.ok) setMsg(`Updated roles: ${(d.roles||[]).join(', ')}`);
    else setMsg(d.error || 'Error');
  };

  if (!roles) return null;
  if (!roles.includes('OWNER') && !roles.includes('ADMIN') && !roles.includes('SUPERADMIN')) return null;
  return (
    <Paper sx={{ p:2, display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:2, alignItems:'center', maxWidth: 900 }}>
      <TextField label="User email" value={email} onChange={e=>setEmail(e.target.value)} />
      <TextField select label="Role" value={role} onChange={e=>setRole(e.target.value)}>
        {['EMPLOYEE','MANAGER','OWNER','ADMIN'].map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
      </TextField>
      <TextField select label="Operation" value={op} onChange={e=>setOp(e.target.value as any)}>
        {['add','remove','set'].map(o => <MenuItem key={o} value={o}>{o.toUpperCase()}</MenuItem>)}
      </TextField>
      <Button onClick={submit} variant="outlined">Apply</Button>
      {msg && <Alert sx={{ gridColumn: '1 / -1' }} severity={msg.startsWith('Updated')?'success':'warning'}>{msg}</Alert>}
    </Paper>
  );
}
