'use client';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ManagerNav() {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [val, setVal] = useState(0);

  useEffect(() => {
    const orgId = (session as any)?.orgId || 'demo';
    const map: Record<number, string> = {
      0: `/org/${orgId}/schedule`,
      1: `/org/${orgId}/people`,
      2: `/org/${orgId}/swaps`,
      3: `/org/${orgId}/reports`,
    };
    const idx = Object.values(map).findIndex((p) => path?.startsWith(p));
    setVal(idx >= 0 ? idx : 0);
  }, [path, session]);

  const handle = (_: any, newVal: number) => {
    setVal(newVal);
    const orgId = (session as any)?.orgId || 'demo';
    if (newVal === 0) router.push(`/org/${orgId}/schedule`);
    if (newVal === 1) router.push(`/org/${orgId}/people`);
    if (newVal === 2) router.push(`/org/${orgId}/swaps`);
    if (newVal === 3) router.push(`/org/${orgId}/reports`);
  };

  return (
    <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: (t) => t.zIndex.appBar }}>
      <BottomNavigation value={val} onChange={handle} showLabels>
        <BottomNavigationAction label="Schedule" icon={<ViewWeekIcon />} />
        <BottomNavigationAction label="People" icon={<PeopleIcon />} />
        <BottomNavigationAction label="Swaps" icon={<SwapHorizIcon />} />
        <BottomNavigationAction label="Reports" icon={<AnalyticsIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
