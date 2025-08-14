
'use client';
import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, TextField, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

type OrgHit = { id: string; name: string; plan: string; seats: { used: number; limit: number; pct: number } };

export default function OrgSearch() {
  const [q, setQ] = useState('');
  const [opts, setOpts] = useState<OrgHit[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(()=>{
    const t = setTimeout(async () => {
      if (!q.trim()) { setOpts([]); return; }
      setLoading(true);
      try {
        const r = await fetch('/api/admin/orgs/search?q=' + encodeURIComponent(q));
        const d = await r.json();
        setOpts(d || []);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <Autocomplete
      options={opts}
      loading={loading}
      getOptionLabel={(o) => o.name}
      onChange={(_, v) => { if (v) router.push('/admin/orgs/' + v.id); }}
      renderOption={(props, option) => {
        const pct = Math.min(100, Math.round(option.seats?.pct*100 || 0));
        const color = pct < 70 ? '#2e7d32' : (pct < 90 ? '#ed6c02' : '#d32f2f');
        return (
          <li {...props} key={option.id} style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
            <span>{option.name}</span>
            <span style={{ fontSize:12, opacity:0.8 }}>Plan: {option.plan} • {option.seats.used}/{option.seats.limit}
              <span style={{ display:'inline-block', width:60, height:6, background:'#eee', marginLeft:8, borderRadius:3, overflow:'hidden' }}>
                <span style={{ display:'inline-block', width: pct+'%', height:'100%', background: color }} />
              </span>
            </span>
          </li>
        );
      }}
      renderInput={(params) => <TextField {...params} label="Org quick search" value={q} onChange={e=>setQ(e.target.value)} />}
    />
  );
}
