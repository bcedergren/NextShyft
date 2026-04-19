'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  Button,
  Paper,
  Stack,
  Alert,
  Divider,
  FormHelperText
} from '@mui/material';
import { PageLayout, PageHeader } from '@/components/page';

export default function GenerationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [settings, setSettings] = useState({
    maxHoursPerWeek: 40,
    minRestHours: 8,
    maxConsecutiveDays: 6,
    fairnessWeight: 0.7,
    avoidOvertimeWeight: 0.8,
    preferAvailabilityWeight: 1.0,
    weekendBalanceWeight: 0.5
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/policy');
      if (res.ok) {
        const policy = await res.json();
        if (policy) {
          setSettings({
            maxHoursPerWeek: policy.constraints?.maxHoursPerWeek || 40,
            minRestHours: policy.constraints?.minRestHours || 8,
            maxConsecutiveDays: policy.constraints?.maxConsecutiveDays || 6,
            fairnessWeight: policy.softPreferences?.fairnessWeight || 0.7,
            avoidOvertimeWeight: policy.softPreferences?.avoidOvertimeWeight || 0.8,
            preferAvailabilityWeight: policy.softPreferences?.preferAvailabilityWeight || 1.0,
            weekendBalanceWeight: policy.softPreferences?.weekendBalanceWeight || 0.5
          });
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/policy', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          constraints: {
            maxHoursPerWeek: settings.maxHoursPerWeek,
            minRestHours: settings.minRestHours,
            maxConsecutiveDays: settings.maxConsecutiveDays,
            requireRoleMatch: true
          },
          softPreferences: {
            fairnessWeight: settings.fairnessWeight,
            avoidOvertimeWeight: settings.avoidOvertimeWeight,
            preferAvailabilityWeight: settings.preferAvailabilityWeight,
            weekendBalanceWeight: settings.weekendBalanceWeight
          }
        })
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <Typography>Loading...</Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="AI Generation Settings"
        subtitle="Configure how the AI scheduler assigns shifts to employees"
      />

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stack spacing={4}>
          {/* Hard Constraints */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Hard Constraints
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These are strict rules that the scheduler will never violate
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Typography gutterBottom>
                  Maximum Hours Per Week
                </Typography>
                <TextField
                  type="number"
                  value={settings.maxHoursPerWeek}
                  onChange={(e) => setSettings({ ...settings, maxHoursPerWeek: parseInt(e.target.value) || 40 })}
                  inputProps={{ min: 1, max: 80 }}
                  fullWidth
                  helperText="Employees will not be scheduled beyond this limit"
                />
              </Box>

              <Box>
                <Typography gutterBottom>
                  Minimum Rest Hours Between Shifts
                </Typography>
                <TextField
                  type="number"
                  value={settings.minRestHours}
                  onChange={(e) => setSettings({ ...settings, minRestHours: parseInt(e.target.value) || 8 })}
                  inputProps={{ min: 0, max: 24 }}
                  fullWidth
                  helperText="Minimum hours required between end of one shift and start of next"
                />
              </Box>

              <Box>
                <Typography gutterBottom>
                  Maximum Consecutive Days
                </Typography>
                <TextField
                  type="number"
                  value={settings.maxConsecutiveDays}
                  onChange={(e) => setSettings({ ...settings, maxConsecutiveDays: parseInt(e.target.value) || 6 })}
                  inputProps={{ min: 1, max: 14 }}
                  fullWidth
                  helperText="Maximum number of days an employee can work in a row"
                />
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Soft Preferences */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Optimization Preferences
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              These weights control how the AI balances different goals (0 = ignore, 1 = prioritize)
            </Typography>

            <Stack spacing={4}>
              <Box>
                <Typography gutterBottom>
                  Fairness Weight: {settings.fairnessWeight.toFixed(2)}
                </Typography>
                <Slider
                  value={settings.fairnessWeight}
                  onChange={(_, value) => setSettings({ ...settings, fairnessWeight: value as number })}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: 'Ignore' },
                    { value: 0.5, label: 'Balanced' },
                    { value: 1, label: 'Maximize' }
                  ]}
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Higher values = distribute hours more evenly across all employees
                </FormHelperText>
              </Box>

              <Box>
                <Typography gutterBottom>
                  Avoid Overtime Weight: {settings.avoidOvertimeWeight.toFixed(2)}
                </Typography>
                <Slider
                  value={settings.avoidOvertimeWeight}
                  onChange={(_, value) => setSettings({ ...settings, avoidOvertimeWeight: value as number })}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: 'Allow' },
                    { value: 0.5, label: 'Prefer Not' },
                    { value: 1, label: 'Avoid' }
                  ]}
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Higher values = try harder to keep employees under max hours
                </FormHelperText>
              </Box>

              <Box>
                <Typography gutterBottom>
                  Prefer Availability Weight: {settings.preferAvailabilityWeight.toFixed(2)}
                </Typography>
                <Slider
                  value={settings.preferAvailabilityWeight}
                  onChange={(_, value) => setSettings({ ...settings, preferAvailabilityWeight: value as number })}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: 'Ignore' },
                    { value: 0.5, label: 'Balanced' },
                    { value: 1, label: 'Strict' }
                  ]}
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Higher values = only assign shifts during employee's available hours
                </FormHelperText>
              </Box>

              <Box>
                <Typography gutterBottom>
                  Weekend Balance Weight: {settings.weekendBalanceWeight.toFixed(2)}
                </Typography>
                <Slider
                  value={settings.weekendBalanceWeight}
                  onChange={(_, value) => setSettings({ ...settings, weekendBalanceWeight: value as number })}
                  min={0}
                  max={1}
                  step={0.1}
                  marks={[
                    { value: 0, label: 'Ignore' },
                    { value: 0.5, label: 'Balanced' },
                    { value: 1, label: 'Maximize' }
                  ]}
                  valueLabelDisplay="auto"
                />
                <FormHelperText>
                  Higher values = distribute weekend shifts more evenly
                </FormHelperText>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Save Button */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={loadSettings}
              disabled={saving}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Info Box */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>How it works:</strong> When you click "Generate Schedule" on the schedule page, 
          the AI will use these settings to automatically assign employees to shifts. The AI considers 
          employee availability, position requirements, and these preferences to create an optimized schedule.
        </Typography>
      </Alert>
    </PageLayout>
  );
}
