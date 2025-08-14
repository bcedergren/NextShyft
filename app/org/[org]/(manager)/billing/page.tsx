
"use client";
import AppShell from '@/components/AppShell';
import { Paper, Stack, Typography, Button, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useState } from 'react';

export default function BillingPage() {
  const [plan, setPlan] = useState('pro');
  const upgrade = async () => {
    const res = await fetch('/api/billing/checkout?plan='+plan, { method:'POST' });
    const { url } = await res.json();
    window.location.href = url;
  };
  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Billing</Typography>
        <Paper sx={{ p:2 }}>
          <RadioGroup value={plan} onChange={(e)=>setPlan(e.target.value)}>
            <FormControlLabel value="pro" control={<Radio/>} label="Pro — $49/mo" />
            <FormControlLabel value="business" control={<Radio/>} label="Business — $99/mo" />
          </RadioGroup>
          <Button variant="contained" onClick={upgrade}>Upgrade</Button>
          <Typography variant="caption" display="block" sx={{ mt:1 }} color="text.secondary">
            Stubbed checkout; wire Stripe keys to enable real payments.
          </Typography>
        </Paper>
        
        {plan==='business' && (
          <Paper sx={{ p:2, mt:2 }}>
            <Typography variant="subtitle2" gutterBottom>Business perks</Typography>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>Unlimited staff & orgs</li>
              <li>Priority solver runtime</li>
              <li>Advanced audit & CSV exports</li>
              <li>Premium support SLAs</li>
            </ul>
          </Paper>
        )}

      </Stack>
    </AppShell>
  );
}
