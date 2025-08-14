import { Box, Container, Stack, Typography } from '@mui/material';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 4 }}>
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="body2" color="text.secondary">
            © {year} NextShyft
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
