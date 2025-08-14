'use client';
import AppShell from '@/components/AppShell';
import { useEffect, useState } from 'react';
import { Button, Paper, Stack, TextField, Typography, Skeleton } from '@mui/material';

export default function PolicyPage() {
  const [policy, setPolicy] = useState<any>(null);
  const [errors, setErrors] = useState<{ [k: string]: string | undefined }>({});
  const hasErrors = Object.values(errors).some(Boolean);
  const [loading, setLoading] = useState<boolean>(true);

  const defaults = {
    constraints: { maxHoursPerWeek: 40, minRestHours: 10, maxConsecutiveDays: 6 },
    softPreferences: { fairnessWeight: 1, preferAvailabilityWeight: 1, avoidOvertimeWeight: 1 },
  };

  const load = async () => {
    setLoading(true);
    try {
      const p = await (await fetch('/api/policy')).json();
      setPolicy(p);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    await fetch('/api/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policy),
    });
    load();
  };

  const validate = (p: any) => {
    const e: any = {};
    const c = p?.constraints || {};
    const s = p?.softPreferences || {};
    if (c.maxHoursPerWeek == null || c.maxHoursPerWeek < 0 || c.maxHoursPerWeek > 168)
      e.maxHoursPerWeek = '0-168 hrs';
    if (c.minRestHours == null || c.minRestHours < 0 || c.minRestHours > 24)
      e.minRestHours = '0-24 hrs';
    if (c.maxConsecutiveDays == null || c.maxConsecutiveDays < 1 || c.maxConsecutiveDays > 7)
      e.maxConsecutiveDays = '1-7 days';
    const weights = ['fairnessWeight', 'preferAvailabilityWeight', 'avoidOvertimeWeight'] as const;
    for (const w of weights) {
      if (s[w] == null || s[w] < 0 || s[w] > 10) e[w] = '0-10';
    }
    setErrors(e);
  };

  const resetToDefaults = () => {
    if (!policy) return;
    const next = {
      ...policy,
      constraints: { ...policy.constraints, ...defaults.constraints },
      softPreferences: { ...policy.softPreferences, ...defaults.softPreferences },
    };
    setPolicy(next);
    validate(next);
  };

  // Ensure validation effect is declared before render branches
  // (was previously placed after a conditional return)

  // validate on load and when policy changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    validate(policy);
  }, [
    policy?.constraints?.maxHoursPerWeek,
    policy?.constraints?.minRestHours,
    policy?.constraints?.maxConsecutiveDays,
    policy?.softPreferences?.fairnessWeight,
    policy?.softPreferences?.preferAvailabilityWeight,
    policy?.softPreferences?.avoidOvertimeWeight,
  ]);

  return (
    <AppShell>
      <Stack spacing={2}>
        <Typography variant="h5">Org Policy</Typography>
        <Paper
          sx={{
            p: 2,
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          {loading || !policy ? (
            <>
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
              <Skeleton variant="rectangular" height={40} />
            </>
          ) : (
            <>
              <TextField
                label="Max Hours/Week"
                type="number"
                value={policy.constraints?.maxHoursPerWeek || 0}
                error={!!errors.maxHoursPerWeek}
                helperText={errors.maxHoursPerWeek || 'Typical: 40'}
                inputProps={{ min: 0, max: 168 }}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    constraints: { ...policy.constraints, maxHoursPerWeek: Number(e.target.value) },
                  })
                }
              />
              <TextField
                label="Min Rest Hours"
                type="number"
                value={policy.constraints?.minRestHours || 0}
                error={!!errors.minRestHours}
                helperText={errors.minRestHours || 'Min rest between shifts'}
                inputProps={{ min: 0, max: 24 }}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    constraints: { ...policy.constraints, minRestHours: Number(e.target.value) },
                  })
                }
              />
              <TextField
                label="Max Consecutive Days"
                type="number"
                value={policy.constraints?.maxConsecutiveDays || 0}
                error={!!errors.maxConsecutiveDays}
                helperText={errors.maxConsecutiveDays || 'Max days worked in a row'}
                inputProps={{ min: 1, max: 7 }}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    constraints: {
                      ...policy.constraints,
                      maxConsecutiveDays: Number(e.target.value),
                    },
                  })
                }
              />
              <TextField
                label="Fairness Weight"
                type="number"
                value={policy.softPreferences?.fairnessWeight || 1}
                error={!!errors.fairnessWeight}
                helperText={errors.fairnessWeight || 'Higher = balance hours across staff'}
                inputProps={{ min: 0, max: 10 }}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    softPreferences: {
                      ...policy.softPreferences,
                      fairnessWeight: Number(e.target.value),
                    },
                  })
                }
              />
              <TextField
                label="Prefer Availability Weight"
                type="number"
                value={policy.softPreferences?.preferAvailabilityWeight || 1}
                error={!!errors.preferAvailabilityWeight}
                helperText={errors.preferAvailabilityWeight || 'Higher = match stated availability'}
                inputProps={{ min: 0, max: 10 }}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    softPreferences: {
                      ...policy.softPreferences,
                      preferAvailabilityWeight: Number(e.target.value),
                    },
                  })
                }
              />
              <TextField
                label="Avoid Overtime Weight"
                type="number"
                value={policy.softPreferences?.avoidOvertimeWeight || 1}
                error={!!errors.avoidOvertimeWeight}
                helperText={errors.avoidOvertimeWeight || 'Higher = discourage >40h weeks'}
                inputProps={{ min: 0, max: 10 }}
                onChange={(e) =>
                  setPolicy({
                    ...policy,
                    softPreferences: {
                      ...policy.softPreferences,
                      avoidOvertimeWeight: Number(e.target.value),
                    },
                  })
                }
              />
            </>
          )}
        </Paper>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button variant="contained" onClick={save} disabled={hasErrors || loading || !policy}>
            Save
          </Button>
          <Button variant="outlined" onClick={resetToDefaults}>
            Reset to defaults
          </Button>
          <Button
            variant="outlined"
            onClick={() => fetch('/api/schedules/lp/generate', { method: 'POST' })}
          >
            Run Solver
          </Button>
        </Stack>
      </Stack>
    </AppShell>
  );
}
