
'use client';
import { useRef, useState } from 'react';
import { Box, Typography } from '@mui/material';

export default function PullToRefresh({ onRefresh, children }:{ onRefresh:()=>Promise<any>|any, children:any }) {
  const startY = useRef<number|null>(null);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = (e: any) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e: any) => {
    if (startY.current === null) return;
    const dy = Math.max(0, e.touches[0].clientY - startY.current);
    setOffset(Math.min(80, dy * 0.6));
  };
  const onTouchEnd = async () => {
    if (offset > 60 && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setOffset(0);
    startY.current = null;
  };

  return (
    <Box onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <Box sx={{ height: offset, display:'flex', alignItems:'center', justifyContent:'center', color:'text.secondary', transition:'height 120ms ease' }}>
        {offset>0 && <Typography variant="caption">{refreshing ? 'Refreshing…' : 'Pull to refresh'}</Typography>}
      </Box>
      {children}
    </Box>
  );
}
