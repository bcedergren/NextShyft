'use client';
import { createTheme } from '@mui/material/styles';

export const palette = {
  primary: { main: '#6C63FF' },
  secondary: { main: '#00BFA6' },
  success: { main: '#2E7D32' },
  warning: { main: '#ED6C02' },
  error: { main: '#D32F2F' },
  backgroundDark: '#0B1020',
  paperDark: '#12172B',
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: palette.primary.main },
    secondary: { main: palette.secondary.main },
  },
  typography: { fontFamily: 'Inter, system-ui, Arial, sans-serif' },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: palette.primary.main },
    secondary: { main: palette.secondary.main },
    background: { default: palette.backgroundDark, paper: palette.paperDark },
  },
  typography: { fontFamily: 'Inter, system-ui, Arial, sans-serif' },
  components: {
    MuiLink: {
      styleOverrides: {
        root: {
          color: palette.primary.main,
          '&:visited': { color: palette.primary.main },
          '&:hover': { color: '#8F89FF', textDecorationColor: '#8F89FF' },
          textDecorationColor: palette.primary.main,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&[href]': {
            color: palette.primary.main,
            textDecoration: 'underline',
            textDecorationColor: palette.primary.main,
            '&:hover': { color: '#8F89FF', textDecorationColor: '#8F89FF' },
          },
        },
      },
    },
  },
});
