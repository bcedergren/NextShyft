'use client';
import { ReactNode, createContext, useMemo, useState, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import ToastProvider from '@/components/ToastProvider';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { darkTheme, lightTheme, nextShyftTheme } from '@/styles/theme';
import { usePathname } from 'next/navigation';

export const ColorModeContext = createContext({ toggle: () => {} });

export default function Providers({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'dark' | 'light'>('light');
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('nextshyft-color-mode') as 'dark' | 'light' | null;
      if (saved) setMode(saved);
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      toggle: () =>
        setMode((prev) => {
          const next = prev === 'dark' ? 'light' : 'dark';
          if (typeof window !== 'undefined') localStorage.setItem('nextshyft-color-mode', next);
          return next;
        }),
    }),
    [],
  );

  // Use NextShyft theme for the landing page, existing theme for other pages
  const theme = pathname === '/' ? nextShyftTheme : mode === 'dark' ? darkTheme : lightTheme;

  return (
    <SessionProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastProvider>{children}</ToastProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </SessionProvider>
  );
}
