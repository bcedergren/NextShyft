'use client';
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';

type Severity = 'success' | 'info' | 'warning' | 'error';

type ToastFn = (message: string, severity?: Severity) => void;

const ToastContext = createContext<ToastFn>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [severity, setSeverity] = useState<Severity>('info');

  const toast = useCallback<ToastFn>((message, sev = 'info') => {
    setMsg(message);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const handleClose = (_?: any, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={2200}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
