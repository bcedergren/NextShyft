'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  Stack,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import { Add, Delete, ColorLens } from '@mui/icons-material';
import { PageLayout, PageHeader } from '@/components/page';
import { useRouter } from 'next/navigation';

const steps = ['Welcome', 'Create Positions', 'Invite Team', 'Shift Templates', 'Configure Policy', 'Complete'];

const SAMPLE_POSITIONS = [
  { name: 'Server', color: '#3b82f6' },
  { name: 'Bartender', color: '#8b5cf6' },
  { name: 'Host', color: '#ec4899' },
  { name: 'Kitchen', color: '#f59e0b' }
];

const SAMPLE_INVITES = [
  'employee1@example.com',
  'employee2@example.com',
  'employee3@example.com'
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Step 2: Positions
  const [positions, setPositions] = useState([
    { name: '', color: '#3b82f6' }
  ]);
  
  // Step 3: Invites
  const [invites, setInvites] = useState(['']);
  
  // Step 4: Policy
  const [policy, setPolicy] = useState({
    maxHoursPerWeek: 40,
    minRestHours: 8,
    maxConsecutiveDays: 6
  });

  const handleNext = async () => {
    setError(null);
    
    try {
      // Validate and save current step
      if (activeStep === 1) {
        // Create positions
        await savePositions();
      } else if (activeStep === 2) {
        // Send invites
        await sendInvites();
      } else if (activeStep === 3) {
        // Skip templates for now (can be created later)
        setActiveStep(activeStep + 1);
        return;
      } else if (activeStep === 4) {
        // Save policy
        await savePolicy();
      }
      
      if (activeStep === steps.length - 1) {
        // Complete wizard
        router.push('../schedule');
      } else {
        setActiveStep(activeStep + 1);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handleSkip = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const useSampleData = async () => {
    setLoading(true);
    try {
      // Create sample positions
      for (const pos of SAMPLE_POSITIONS) {
        await fetch('/api/positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(pos)
        });
      }
      
      // Set sample invites
      setInvites(SAMPLE_INVITES);
      
      // Jump to final step
      setActiveStep(steps.length - 1);
    } catch (err) {
      console.error('Failed to create sample data:', err);
    } finally {
      setLoading(false);
    }
  };

  const savePositions = async () => {
    const validPositions = positions.filter(p => p.name.trim());
    if (validPositions.length === 0) {
      throw new Error('Please create at least one position');
    }
    
    setLoading(true);
    for (const position of validPositions) {
      const res = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(position)
      });
      if (!res.ok) throw new Error('Failed to create position');
    }
    setLoading(false);
  };

  const sendInvites = async () => {
    const validInvites = invites.filter(email => email.trim() && email.includes('@'));
    if (validInvites.length === 0) {
      // Skip if no invites (optional step)
      return;
    }
    
    setLoading(true);
    for (const email of validInvites) {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          roles: ['EMPLOYEE']
        })
      });
      if (!res.ok) console.error('Failed to send invite to', email);
    }
    setLoading(false);
  };

  const savePolicy = async () => {
    const res = await fetch('/api/policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        constraints: {
          maxHoursPerWeek: policy.maxHoursPerWeek,
          minRestHours: policy.minRestHours,
          maxConsecutiveDays: policy.maxConsecutiveDays,
          requireRoleMatch: true
        }
      })
    });
    if (!res.ok) throw new Error('Failed to save policy');
  };

  const addPosition = () => {
    setPositions([...positions, { name: '', color: '#3b82f6' }]);
  };

  const removePosition = (index: number) => {
    setPositions(positions.filter((_, i) => i !== index));
  };

  const updatePosition = (index: number, field: 'name' | 'color', value: string) => {
    const newPositions = [...positions];
    newPositions[index][field] = value;
    setPositions(newPositions);
  };

  const addInvite = () => {
    setInvites([...invites, '']);
  };

  const removeInvite = (index: number) => {
    setInvites(invites.filter((_, i) => i !== index));
  };

  const updateInvite = (index: number, value: string) => {
    const newInvites = [...invites];
    newInvites[index] = value;
    setInvites(newInvites);
  };

  return (
    <PageLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <PageHeader
          title="Get Started with NextShyft"
          subtitle="Let's set up your organization in a few simple steps"
        />

        <Paper sx={{ p: 4, mt: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Step Content */}
          <Box sx={{ minHeight: 300 }}>
            {activeStep === 0 && (
              <Stack spacing={3}>
                <Typography variant="h5">Welcome to NextShyft!</Typography>
                <Typography>
                  We'll help you set up your organization's scheduling system in just a few minutes.
                  You can always customize these settings later.
                </Typography>
                <Typography>
                  <strong>What we'll set up:</strong>
                </Typography>
                <List>
                  <ListItem>📋 Job positions (like Server, Bartender, Host)</ListItem>
                  <ListItem>👥 Invite your team members</ListItem>
                  <ListItem>⚙️ Configure scheduling rules</ListItem>
                </List>
                <Button
                  variant="outlined"
                  onClick={useSampleData}
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Try with Demo Data'}
                </Button>
                <Typography variant="caption" color="text.secondary">
                  Demo data creates sample positions and invites to help you explore the app
                </Typography>
              </Stack>
            )}

            {activeStep === 1 && (
              <Stack spacing={3}>
                <Typography variant="h5">Create Your First Positions</Typography>
                <Typography color="text.secondary">
                  What roles does your team work in? (e.g., Server, Bartender, Host, Kitchen)
                </Typography>
                
                {positions.map((position, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <TextField
                      label="Position Name"
                      value={position.name}
                      onChange={(e) => updatePosition(index, 'name', e.target.value)}
                      fullWidth
                      placeholder="e.g., Server"
                    />
                    <input
                      type="color"
                      value={position.color}
                      onChange={(e) => updatePosition(index, 'color', e.target.value)}
                      style={{ width: 60, height: 40, border: 'none', cursor: 'pointer' }}
                    />
                    {positions.length > 1 && (
                      <IconButton onClick={() => removePosition(index)} color="error">
                        <Delete />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                
                <Button
                  startIcon={<Add />}
                  onClick={addPosition}
                  variant="outlined"
                >
                  Add Another Position
                </Button>
              </Stack>
            )}

            {activeStep === 2 && (
              <Stack spacing={3}>
                <Typography variant="h5">Invite Your Team</Typography>
                <Typography color="text.secondary">
                  Send invitations to your employees (optional - you can do this later)
                </Typography>
                
                {invites.map((email, index) => (
                  <Stack key={index} direction="row" spacing={2} alignItems="center">
                    <TextField
                      label="Email Address"
                      value={email}
                      onChange={(e) => updateInvite(index, e.target.value)}
                      fullWidth
                      type="email"
                      placeholder="employee@example.com"
                    />
                    {invites.length > 1 && (
                      <IconButton onClick={() => removeInvite(index)} color="error">
                        <Delete />
                      </IconButton>
                    )}
                  </Stack>
                ))}
                
                <Button
                  startIcon={<Add />}
                  onClick={addInvite}
                  variant="outlined"
                >
                  Add Another Invite
                </Button>
              </Stack>
            )}

            {activeStep === 3 && (
              <Stack spacing={3}>
                <Typography variant="h5">Shift Templates</Typography>
                <Typography color="text.secondary">
                  You'll create shift templates on the schedule page. Skip this for now.
                </Typography>
                <Alert severity="info">
                  After completing this wizard, you can create shift templates and use the AI 
                  scheduler to automatically assign employees to shifts.
                </Alert>
              </Stack>
            )}

            {activeStep === 4 && (
              <Stack spacing={3}>
                <Typography variant="h5">Configure Scheduling Rules</Typography>
                <Typography color="text.secondary">
                  Set basic rules for how schedules are created
                </Typography>
                
                <TextField
                  label="Maximum Hours Per Week"
                  type="number"
                  value={policy.maxHoursPerWeek}
                  onChange={(e) => setPolicy({ ...policy, maxHoursPerWeek: parseInt(e.target.value) || 40 })}
                  inputProps={{ min: 1, max: 80 }}
                  fullWidth
                  helperText="Employees won't be scheduled beyond this limit"
                />
                
                <TextField
                  label="Minimum Rest Hours Between Shifts"
                  type="number"
                  value={policy.minRestHours}
                  onChange={(e) => setPolicy({ ...policy, minRestHours: parseInt(e.target.value) || 8 })}
                  inputProps={{ min: 0, max: 24 }}
                  fullWidth
                  helperText="Minimum hours required between shifts"
                />
                
                <TextField
                  label="Maximum Consecutive Days"
                  type="number"
                  value={policy.maxConsecutiveDays}
                  onChange={(e) => setPolicy({ ...policy, maxConsecutiveDays: parseInt(e.target.value) || 6 })}
                  inputProps={{ min: 1, max: 14 }}
                  fullWidth
                  helperText="Maximum days an employee can work in a row"
                />
              </Stack>
            )}

            {activeStep === 5 && (
              <Stack spacing={3} alignItems="center">
                <Typography variant="h5">You're All Set! 🎉</Typography>
                <Typography textAlign="center">
                  Your organization is configured and ready to go. 
                  You can now create schedules, manage your team, and start scheduling shifts.
                </Typography>
                <Alert severity="success" sx={{ width: '100%' }}>
                  <Typography variant="body2">
                    <strong>Next steps:</strong>
                  </Typography>
                  <Typography variant="body2" component="ul" sx={{ pl: 2, mt: 1 }}>
                    <li>Go to the Schedule page to create your first schedule</li>
                    <li>Create shift templates for recurring shifts</li>
                    <li>Use the AI generator to auto-assign employees</li>
                    <li>Publish schedules to notify your team</li>
                  </Typography>
                </Alert>
              </Stack>
            )}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
            >
              Back
            </Button>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep > 0 && activeStep < steps.length - 1 && (
                <Button onClick={handleSkip} disabled={loading}>
                  Skip
                </Button>
              )}
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : activeStep === steps.length - 1 ? (
                  'Go to Schedule'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </PageLayout>
  );
}
