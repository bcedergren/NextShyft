'use client';
import { useEffect, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

let installed = false;
const listeners: ((hit: boolean) => void)[] = [];

function installFetchHook() {
  if (installed) return;
  installed = true;
  const orig = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      const res = await orig(input, init);
      if (res.status === 429) listeners.forEach((fn) => fn(true));
      return res;
    } catch (err) {
      // Normalize transient network errors (e.g., ERR_NETWORK_CHANGED) to a 503 JSON response
      // so callers using res.json() don't crash on rejected fetch promises.
      const body = JSON.stringify({ error: 'network-changed' });
      return new Response(body, { status: 503, headers: { 'Content-Type': 'application/json' } });
    }
  };
}

export default function RateLimitToast() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    installFetchHook();
    const fn = (hit: boolean) => {
      if (hit) setOpen(true);
    };
    listeners.push(fn);
    return () => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={() => setOpen(false)}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert severity="warning" onClose={() => setOpen(false)}>
        You’re doing that too fast. Please wait a moment and try again.
      </Alert>
    </Snackbar>
  );
}
