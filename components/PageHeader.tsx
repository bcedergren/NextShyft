import { Box, Typography, Stack, Breadcrumbs, Link } from '@mui/material';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: ReactNode;
  variant?: 'default' | 'compact';
  titleStart?: ReactNode; // Optional leading element next to the title (e.g., logo)
  titleBelow?: boolean; // When true, stack title below titleStart (logo above, title below)
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  variant = 'default',
  titleStart,
  titleBelow = false,
}: PageHeaderProps) {
  return (
    <Box
      sx={{
        mb: variant === 'compact' ? 2 : 4,
        pb: variant === 'compact' ? 1 : 2,
        borderBottom: variant === 'compact' ? 'none' : '1px solid #f3f4f6',
      }}
    >
      <Stack spacing={variant === 'compact' ? 1 : 2}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator="›"
            sx={{
              color: '#6b7280',
              '& .MuiBreadcrumbs-separator': { color: '#d1d5db' },
            }}
          >
            {breadcrumbs.map((crumb, index) =>
              crumb.href ? (
                <Link
                  key={index}
                  href={crumb.href}
                  color="inherit"
                  sx={{
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                  }}
                >
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={index} variant="body2" color="inherit">
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        )}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                gap: titleBelow ? 0.75 : 1.25,
                flexDirection: titleBelow ? 'column' : 'row',
                alignItems: titleBelow ? 'flex-start' : 'center',
              }}
            >
              {titleStart}
              <Typography
                variant={variant === 'compact' ? 'h5' : 'h3'}
                fontWeight="300"
                sx={{
                  color: '#1f2937',
                  fontSize: variant === 'compact' ? '1.5rem' : '2.5rem',
                  mb: subtitle ? 1 : 0,
                }}
              >
                {title}
              </Typography>
            </Box>
            {subtitle && (
              <Typography
                variant="h6"
                color="#6b7280"
                fontWeight="300"
                sx={{
                  fontSize: variant === 'compact' ? '1rem' : '1.25rem',
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          {actions && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexShrink: 0,
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
