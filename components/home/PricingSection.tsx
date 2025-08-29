'use client';
import Link from 'next/link';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

export default function PricingSection() {
  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h3" textAlign="center" fontWeight="bold">
          Simple, transparent pricing
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" maxWidth={600}>
          Choose the plan that fits your team size and needs. All plans include our core features.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={4} sx={{ mt: 6, flexWrap: 'wrap' }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 4, height: '100%', position: 'relative' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Starter
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              $29<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span>
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Perfect for small teams getting started
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Up to 25 team members" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Basic scheduling tools" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Email notifications" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Email support" />
              </ListItem>
            </List>
            <Box sx={{ mt: 3 }}>
              <Link href="/signup">
                <Button variant="outlined" fullWidth>
                  Get Started
                </Button>
              </Link>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Paper
            sx={{
              p: 4,
              height: '100%',
              position: 'relative',
              border: '2px solid',
              borderColor: 'primary.main',
            }}
          >
            <Chip
              label="Most Popular"
              color="primary"
              sx={{ position: 'absolute', top: 16, right: 16 }}
            />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Professional
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              $79<span style={{ fontSize: '1rem', fontWeight: 'normal' }}>/month</span>
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Ideal for growing businesses
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Up to 100 team members" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Advanced scheduling features" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Push notifications" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Analytics dashboard" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Priority support" />
              </ListItem>
            </List>
            <Box sx={{ mt: 3 }}>
              <Link href="/signup">
                <Button variant="contained" fullWidth>
                  Start Free Trial
                </Button>
              </Link>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.333% - 16px)' } }}>
          <Paper sx={{ p: 4, height: '100%', position: 'relative' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Enterprise
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
              Custom
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              For large organizations with complex needs
            </Typography>
            <List dense>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Unlimited team members" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Custom integrations" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Advanced security features" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Dedicated support team" />
              </ListItem>
              <ListItem sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Custom training & onboarding" />
              </ListItem>
            </List>
            <Box sx={{ mt: 3 }}>
              <Link href="/signup">
                <Button variant="outlined" fullWidth>
                  Contact Sales
                </Button>
              </Link>
            </Box>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
