'use client';

import { Box, Button, Skeleton, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const INK = '#0F1B2D';
const MUTED = '#5B677A';
const BORDER = 'rgba(15, 27, 45, 0.10)';

export default function SettingsPage() {
  const { data: session } = useSession();
  const orgId = (session as any)?.orgId ?? null;
  const [org, setOrg] = useState<{ name?: string; signupCode?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    fetch('/api/org')
      .then((r) => r.json())
      .then(setOrg)
      .catch(() => setOrg(null))
      .finally(() => setLoading(false));
  }, [orgId]);

  return (
    <Box sx={{ p: 2, maxWidth: 640, mx: 'auto' }}>
      <Typography variant="h5" fontWeight="600" sx={{ color: INK, mb: 2 }}>
        Settings
      </Typography>
      <Typography variant="body2" sx={{ color: MUTED, mb: 3 }}>
        Organization and app preferences. Use full org settings for signup code, invite, and
        suspension.
      </Typography>

      <Box
        sx={{
          p: 2.5,
          border: `1px solid ${BORDER}`,
          borderRadius: 2,
          bgcolor: '#FFFFFF',
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight="600" sx={{ color: INK, mb: 1 }}>
          Organization
        </Typography>
        {loading ? (
          <Skeleton variant="text" width="60%" />
        ) : org ? (
          <>
            <Typography variant="body2" sx={{ color: MUTED }}>
              Name: {org.name || '—'}
            </Typography>
            {org.signupCode && (
              <Typography variant="body2" sx={{ color: MUTED, mt: 0.5 }}>
                Signup code: {org.signupCode}
              </Typography>
            )}
            {orgId && (
              <Button
                component={Link}
                href={`/org/${orgId}/org-settings`}
                variant="outlined"
                size="small"
                sx={{ mt: 2 }}
              >
                Full org settings
              </Button>
            )}
          </>
        ) : (
          <Typography variant="body2" sx={{ color: MUTED }}>
            {orgId ? 'Could not load organization.' : 'Sign in and select an organization to manage settings.'}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          p: 2.5,
          border: `1px solid ${BORDER}`,
          borderRadius: 2,
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography variant="subtitle1" fontWeight="600" sx={{ color: INK, mb: 1 }}>
          Notifications
        </Typography>
        <Typography variant="body2" sx={{ color: MUTED }}>
          Email and push notification preferences. Configure in your profile or org settings.
        </Typography>
      </Box>
    </Box>
  );
}
