import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      dark: '#1565C0',
      light: '#42A5F5',
    },
    secondary: {
      main: '#00796B',
      light: '#26A69A',
    },
    success: {
      main: '#4CAF50',
    },
    warning: {
      main: '#FFA000',
    },
    error: {
      main: '#D32F2F',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Segoe UI", "sans-serif"',
    h1: { fontSize: '2rem', fontWeight: 500 },
    h2: { fontSize: '1.75rem', fontWeight: 500 },
    h3: { fontSize: '1.5rem', fontWeight: 500 },
    h4: { fontSize: '1.25rem', fontWeight: 500 },
    h5: { fontSize: '1.1rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

export default theme;
