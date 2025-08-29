'use client';
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Box
      sx={{
        borderTop: '1px solid #f3f4f6',
        py: 6,
        bgcolor: '#fff',
      }}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="#9ca3af" align="center" fontWeight="400">
          © {year} NextShyft. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
