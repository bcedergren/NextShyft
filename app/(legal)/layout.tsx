import { Box, Container } from '@mui/material';

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      {children}
    </Container>
  );
}
