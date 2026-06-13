import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#6366f1' },
    success: { main: '#10b981' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: 'Inter, sans-serif' },
});
