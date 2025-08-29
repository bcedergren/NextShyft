import { Box, Paper, Typography, Stack, Divider } from '@mui/material';
import { ReactNode } from 'react';

interface PageSectionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'card' | 'minimal';
  spacing?: number;
  padding?: number;
  divider?: boolean;
  actions?: ReactNode;
}

export default function PageSection({ 
  children, 
  title, 
  subtitle, 
  variant = 'default',
  spacing = 3,
  padding = 3,
  divider = false,
  actions
}: PageSectionProps) {
  const content = (
    <Stack spacing={spacing}>
      {(title || subtitle || actions) && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {title && (
              <Typography 
                variant="h5" 
                fontWeight="400" 
                sx={{ 
                  color: '#1f2937',
                  mb: subtitle ? 1 : 0
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography 
                variant="body1" 
                color="#6b7280" 
                sx={{ lineHeight: 1.5 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {actions && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              flexShrink: 0
            }}>
              {actions}
            </Box>
          )}
        </Box>
      )}
      
      {divider && title && <Divider sx={{ borderColor: '#f3f4f6' }} />}
      
      <Box>
        {children}
      </Box>
    </Stack>
  );

  if (variant === 'card') {
    return (
      <Paper 
        sx={{ 
          p: padding,
          border: '1px solid #f3f4f6',
          borderRadius: 2,
          bgcolor: '#fff',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
        }}
      >
        {content}
      </Paper>
    );
  }

  if (variant === 'minimal') {
    return (
      <Box sx={{ p: padding }}>
        {content}
      </Box>
    );
  }

  return (
    <Box sx={{ p: padding }}>
      {content}
    </Box>
  );
}
