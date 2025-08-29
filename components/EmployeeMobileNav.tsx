'use client';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import PeopleIcon from '@mui/icons-material/People';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function EmployeeMobileNav() {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [val, setVal] = useState(0);

  useEffect(() => {
    const orgId = (session as any)?.orgId || 'demo';
    const map: Record<number, string> = {
      0: `/org/${orgId}/dashboard`,
      1: `/org/${orgId}/myschedule`,
      2: `/org/${orgId}/availability`,
    };
    const idx = Object.values(map).findIndex((p) => path?.startsWith(p));
    setVal(idx >= 0 ? idx : 0);
  }, [path, session]);

  const handle = (_: any, newVal: number) => {
    setVal(newVal);
    const orgId = (session as any)?.orgId || 'demo';
    if (newVal === 0) router.push(`/org/${orgId}/dashboard`);
    if (newVal === 1) router.push(`/org/${orgId}/myschedule`);
    if (newVal === 2) router.push(`/org/${orgId}/availability`);
  };

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (t) => t.zIndex.appBar,
        borderTop: '1px solid #f3f4f6',
        bgcolor: '#fff',
      }}
    >
      <BottomNavigation
        value={val}
        onChange={handle}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            color: '#6b7280',
            '&.Mui-selected': {
              color: '#1f2937',
            },
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            fontWeight: 400,
          },
        }}
      >
        <BottomNavigationAction label="Dashboard" icon={<HomeIcon />} />
        <BottomNavigationAction label="Schedule" icon={<ViewWeekIcon />} />
        <BottomNavigationAction label="Availability" icon={<PeopleIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
