'use client';
import { createTheme } from '@mui/material/styles';

export const palette = {
  primary: { main: '#1f2937' }, // slate-800/900
  secondary: { main: '#6b7280' }, // slate-500
  info: { main: '#0284c7', hover: '#0ea5e9' }, // sky-600/500
  success: { main: '#059669', hover: '#10b981' }, // emerald-600/500
  warning: { main: '#ED6C02' },
  error: { main: '#D32F2F' },
  backgroundDark: '#0B1020',
  paperDark: '#12172B',
};

// New minimal NextShyft theme
export const nextShyftTheme = createTheme({
  palette: {
    primary: { main: '#1f2937' },
    secondary: { main: '#6b7280' },
    info: { main: palette.info.main },
    success: { main: palette.success.main },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
    background: {
      default: '#fff',
      paper: '#f9fafb',
    },
    divider: '#f3f4f6',
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      'sans-serif',
    ].join(','),
    h1: { fontWeight: 200 },
    h2: { fontWeight: 300 },
    h3: { fontWeight: 400 },
    h4: { fontWeight: 300 },
    h5: { fontWeight: 300 },
    h6: { fontWeight: 300 },
    body1: { fontWeight: 400 },
    body2: { fontWeight: 400 },
    button: { fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          '&:hover': { backgroundColor: '#111827' },
        },
        containedInfo: {
          color: '#fff',
          backgroundColor: palette.info.main,
          '&:hover': { backgroundColor: palette.info.hover },
        },
        containedSuccess: {
          color: '#fff',
          backgroundColor: palette.success.main,
          '&:hover': { backgroundColor: palette.success.hover },
        },
        containedInherit: {
          color: '#fff',
          backgroundColor: '#0f172a', // slate-900
          '&:hover': { backgroundColor: '#1f2937' }, // slate-800
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #f3f4f6',
        },
      },
    },
  },
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: palette.primary.main },
    secondary: { main: palette.secondary.main },
    info: { main: palette.info.main },
    success: { main: palette.success.main },
    background: {
      default: '#fff',
      paper: '#f9fafb',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    fontWeightLight: 200,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        containedInfo: {
          color: '#fff',
          backgroundColor: palette.info.main,
          '&:hover': { backgroundColor: palette.info.hover },
        },
        containedSuccess: {
          color: '#fff',
          backgroundColor: palette.success.main,
          '&:hover': { backgroundColor: palette.success.hover },
        },
        containedInherit: {
          color: '#fff',
          backgroundColor: '#0f172a',
          '&:hover': { backgroundColor: '#1f2937' },
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: palette.primary.main },
    secondary: { main: palette.secondary.main },
    info: { main: palette.info.main },
    success: { main: palette.success.main },
    background: { default: palette.backgroundDark, paper: palette.paperDark },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
    fontWeightLight: 200,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        containedInfo: {
          color: '#fff',
          backgroundColor: palette.info.main,
          '&:hover': { backgroundColor: palette.info.hover },
        },
        containedSuccess: {
          color: '#fff',
          backgroundColor: palette.success.main,
          '&:hover': { backgroundColor: palette.success.hover },
        },
        containedInherit: {
          color: '#fff',
          backgroundColor: '#0f172a',
          '&:hover': { backgroundColor: '#1f2937' },
        },
      },
    },
  },
});
