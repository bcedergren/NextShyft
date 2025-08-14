'use client';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AvTimerIcon from '@mui/icons-material/AvTimer';
import InboxIcon from '@mui/icons-material/Inbox';
import PersonIcon from '@mui/icons-material/Person';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export default function EmployeeNav() {
  const path = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [val, setVal] = useState(0);

  useEffect(() => {
    const orgId = (session as any)?.orgId || 'demo';
    const map: Record<number, string> = {
      0: `/org/${orgId}/me`,
      1: `/org/${orgId}/hours`,
      2: `/org/${orgId}/inbox`,
      3: `/org/${orgId}/profile`,
    };
    const idx = Object.values(map).findIndex((p) => path?.startsWith(p));
    setVal(idx >= 0 ? idx : 0);
  }, [path, session]);

  const handle = (_: any, newVal: number) => {
    setVal(newVal);
    const orgId = (session as any)?.orgId || 'demo';
    if (newVal === 0) router.push(`/org/${orgId}/me`);
    if (newVal === 1) router.push(`/org/${orgId}/hours`);
    if (newVal === 2) router.push(`/org/${orgId}/inbox`);
    if (newVal === 3) router.push(`/org/${orgId}/profile`);
  };

  return (
    <Paper sx={{ position: 'sticky', bottom: 0, left: 0, right: 0 }}>
      <BottomNavigation value={val} onChange={handle} showLabels>
        <BottomNavigationAction label="Schedule" icon={<CalendarMonthIcon />} />
        <BottomNavigationAction label="Hours" icon={<AvTimerIcon />} />
        <BottomNavigationAction label="Inbox" icon={<InboxIcon />} />
        <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
      </BottomNavigation>
    </Paper>
  );
}
