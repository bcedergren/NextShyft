
'use client';
import AppShell from '@/components/AppShell';
import { useState } from 'react';
import { Box, Button, Paper, Stack, Step, StepLabel, Stepper, TextField, Typography } from '@mui/material';
import Link from 'next/link';

const steps = ['Coverage', 'Generate', 'Solve', 'Review', 'Publish'];

export default function Wizard() {
  const [active, setActive] = useState(0);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState<string>('');

  const next = () => setActive(s => Math.min(s+1, steps.length-1));
  const prev = () => setActive(s => Math.max(s-1, 0));

  const doGenerate = async () => {
    if (!start || !end) return;
    setStatus('Generating…');
    await fetch('/api/schedules', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ periodStart: start, periodEnd: end }) });
    setStatus('Generated.');
    next();
  };
  const doSolve = async () => {
    setStatus('Solving…');
    await fetch('/api/schedules/lp/generate', { method:'POST' });
    setStatus('Solved.');
    next();
  };
  const doPublish = async () => {
    setStatus('Publishing…');
    const schedules = await (await fetch('/api/schedules')).json();
    if (schedules[0]) await fetch(`/api/schedules/${schedules[0]._id}/publish`, { method:'POST' });
    setStatus('Published.');
  };

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Schedule Wizard</Typography>
        <Stepper activeStep={active}>
          {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>

        {active===0 && (
          <Paper sx={{ p:2 }}>
            <Typography sx={{ mb:1 }}>1) Validate or adjust coverage in the Coverage page.</Typography>
            <Button href="/org/demo/(manager)/coverage" component={Link} variant="outlined">Open Coverage</Button>
            <Box sx={{ mt:2 }}>
              <Button variant="contained" onClick={next}>Continue</Button>
            </Box>
          </Paper>
        )}

        {active===1 && (
          <Paper sx={{ p:2, display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:2, alignItems:'center' }}>
            <TextField type="date" label="Start" InputLabelProps={{ shrink:true }} value={start} onChange={e=>setStart(e.target.value)} />
            <TextField type="date" label="End" InputLabelProps={{ shrink:true }} value={end} onChange={e=>setEnd(e.target.value)} />
            <Button variant="contained" onClick={doGenerate}>Generate</Button>
            <Typography>{status}</Typography>
            <Box sx={{ gridColumn:'1 / -1' }}>
              <Button onClick={prev}>Back</Button>
              <Button onClick={next} variant="outlined" sx={{ ml:1 }}>Next</Button>
            </Box>
          </Paper>
        )}

        {active===2 && (
          <Paper sx={{ p:2 }}>
            <Typography sx={{ mb:1 }}>Run the solver to assign staff.</Typography>
            <Button variant="contained" onClick={doSolve}>Run Solver</Button>
            <Typography sx={{ mt:1 }}>{status}</Typography>
            <Box sx={{ mt:2 }}>
              <Button onClick={prev}>Back</Button>
              <Button onClick={next} variant="outlined" sx={{ ml:1 }}>Next</Button>
            </Box>
          </Paper>
        )}

        {active===3 && (
          <Paper sx={{ p:2 }}>
            <Typography sx={{ mb:1 }}>Review and tweak in the Schedule Builder.</Typography>
            <Button href="/org/demo/(manager)/schedule" component={Link} variant="outlined">Open Schedule Builder</Button>
            <Box sx={{ mt:2 }}>
              <Button onClick={prev}>Back</Button>
              <Button onClick={next} variant="outlined" sx={{ ml:1 }}>Next</Button>
            </Box>
          </Paper>
        )}

        {active===4 && (
          <Paper sx={{ p:2 }}>
            <Typography sx={{ mb:1 }}>Publish to notify your team.</Typography>
            <Button variant="contained" onClick={doPublish}>Publish</Button>
            <Typography sx={{ mt:1 }}>{status}</Typography>
            <Box sx={{ mt:2 }}>
              <Button onClick={prev}>Back</Button>
            </Box>
          </Paper>
        )}
      </Stack>
    </AppShell>
  );
}
