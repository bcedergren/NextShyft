'use client';
import { Box, Paper, Stack, Typography, TextField, Button } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupportIcon from '@mui/icons-material/Support';

export default function ContactSection() {
  return (
    <Box sx={{ py: 4 }}>
      <Stack spacing={4} alignItems="center">
        <Typography variant="h3" textAlign="center" fontWeight="bold">
          Get in touch
        </Typography>
        <Typography variant="h6" color="text.secondary" textAlign="center" maxWidth={600}>
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as
          possible.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={6} sx={{ mt: 6, flexWrap: 'wrap' }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 24px)' } }}>
          <Stack spacing={3}>
            <Typography variant="h5" fontWeight="bold">
              Contact Information
            </Typography>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <EmailIcon color="primary" />
                <Typography>support@nextshyft.com</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <PhoneIcon color="primary" />
                <Typography>+1 (555) 123-4567</Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <LocationOnIcon color="primary" />
                <Typography>
                  123 Business St, Suite 100
                  <br />
                  City, State 12345
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <SupportIcon color="primary" />
                <Typography>24/7 support available</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Box>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 24px)' } }}>
          <Paper sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight="bold">
                Send us a message
              </Typography>
              <TextField label="Name" fullWidth />
              <TextField label="Email" fullWidth type="email" />
              <TextField label="Company" fullWidth />
              <TextField label="Message" fullWidth multiline rows={4} />
              <Button variant="contained" size="large" sx={{ alignSelf: 'flex-start' }}>
                Send Message
              </Button>
            </Stack>
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
