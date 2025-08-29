'use client';
import { Box, Button, Container, Tooltip } from '@mui/material';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import HomeIcon from '@mui/icons-material/Home';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PeopleIcon from '@mui/icons-material/People';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from '@mui/icons-material/Campaign';
import PersonIcon from '@mui/icons-material/Person';

export default function EmployeeNav() {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('');

  const orgId = (session as any)?.orgId || 'demo';

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: `/org/${orgId}/dashboard`, icon: <HomeIcon /> },
    {
      id: 'myschedule',
      label: 'Company Schedule',
      path: `/org/${orgId}/myschedule`,
      icon: <ViewWeekIcon />,
    },
    {
      id: 'availability',
      label: 'Availability',
      path: `/org/${orgId}/availability`,
      icon: <PeopleIcon />,
    },
    { id: 'hours', label: 'Hours', path: `/org/${orgId}/hours`, icon: <AnalyticsIcon /> },
    { id: 'inbox', label: 'Inbox', path: `/org/${orgId}/inbox`, icon: <CampaignIcon /> },
    { id: 'profile', label: 'Profile', path: `/org/${orgId}/profile`, icon: <PersonIcon /> },
  ];

  useEffect(() => {
    const currentPath = path || '';
    const activeTab = tabs.find((tab) => currentPath.startsWith(tab.path));
    setActiveTab(activeTab?.id || 'dashboard');
  }, [path, tabs]);

  const handleTabClick = (tabId: string, tabPath: string) => {
    setActiveTab(tabId);
    router.push(tabPath);
  };

  return (
    <Box
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Container disableGutters maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 1,
            py: 1,
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => (
            <Tooltip key={tab.id} title={tab.label}>
              <Button
                color="inherit"
                size="small"
                onClick={() => handleTabClick(tab.id, tab.path)}
                startIcon={tab.icon}
                sx={{
                  textTransform: 'none',
                  opacity: activeTab === tab.id ? 1 : 0.85,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? '#1f2937' : '#6b7280',
                  minWidth: 'auto',
                  px: 2,
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.04)',
                  },
                }}
              >
                {tab.label}
              </Button>
            </Tooltip>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
