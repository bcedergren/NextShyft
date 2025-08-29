import { Box, Container, Stack } from '@mui/material';
import { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  spacing?: number;
  padding?: number | { xs?: number; sm?: number; md?: number };
  disableGutters?: boolean;
  fullWidth?: boolean;
}

export default function PageLayout({ 
  children, 
  maxWidth = 'xl',
  spacing = 4,
  padding = { xs: 2, md: 4 },
  disableGutters = false,
  fullWidth = false
}: PageLayoutProps) {
  const paddingValue = typeof padding === 'number' ? padding : padding;
  
  if (fullWidth) {
    return (
      <Box sx={{ 
        py: paddingValue,
        px: disableGutters ? 0 : paddingValue
      }}>
        <Stack spacing={spacing}>
          {children}
        </Stack>
      </Box>
    );
  }

  return (
    <Container 
      maxWidth={maxWidth} 
      disableGutters={disableGutters}
      sx={{ 
        py: paddingValue,
        px: disableGutters ? 0 : paddingValue
      }}
    >
      <Stack spacing={spacing}>
        {children}
      </Stack>
    </Container>
  );
}
