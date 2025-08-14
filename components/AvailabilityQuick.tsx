
'use client';
import { Button, Stack } from '@mui/material';
import { useEffect } from 'react';

export default function AvailabilityQuick({ onCopy, onClear }:{ onCopy:()=>void, onClear:()=>void }) {
  return (
    <Stack direction="row" spacing={1}>
      <Button size="small" onClick={onCopy}>Copy Mon → all</Button>
      <Button size="small" onClick={onClear}>Clear week</Button>
    </Stack>
  );
}
