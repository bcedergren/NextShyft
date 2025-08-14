
'use client';
import { useRef, useState } from 'react';
import { Box, Button } from '@mui/material';

export default function SwipeItem({ children, onDelete }:{ children:any, onDelete:()=>void }) {
  const startX = useRef<number|null>(null);
  const [dx, setDx] = useState(0);

  const onTouchStart = (e:any) => { startX.current = e.touches[0].clientX; };
  const onTouchMove = (e:any) => {
    if (startX.current===null) return;
    const delta = e.touches[0].clientX - startX.current;
    setDx(Math.max(Math.min(delta, 0), -120));
  };
  const onTouchEnd = () => {
    if (dx < -80) setDx(-120); else setDx(0);
  };

  return (
    <Box sx={{ position:'relative', overflow:'hidden' }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <Box sx={{ position:'absolute', right:0, top:0, bottom:0, width:120, bgcolor:'error.main', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Button variant="text" sx={{ color:'white' }} onClick={onDelete}>Delete</Button>
      </Box>
      <Box sx={{ position:'relative', transform:`translateX(${dx}px)`, transition: 'transform 160ms ease' }}>
        {children}
      </Box>
    </Box>
  );
}
