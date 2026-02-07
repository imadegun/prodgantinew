import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00796B',
      light: '#26A69A',
      dark: '#006954A',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
      light: '#F44476',
      dark: '#C62828',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#FFA000',
      light: '#FFC107',
      dark: '#FF6F00',
      contrastText: '#000000',
    },
    success: {
      main: '#4CAF50',
      light: '#81C784',
      dark: '#66BB6A',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#2196F3',
      light: '#4DB3F7',
      dark: '#1565C0',
      contrastText: '#FFFFFF',
    },
    text: {
      50: '#757575',
      100: '#9E9E9E',
      200: '#BDBDBD',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#9E9E9E',
      800: '#9E9E9E',
      900: '#9E9E9E',
      A100: '#A5A5A5',
      A200: '#A5A5A5',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Segoe UI', sans-serif",
    fontSize: 14,
    h1: {
      fontSize: '2rem',
      fontWeight: 500,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
      lineHeight: 1.4,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    h5: {
      fontSize: '1.15rem',
      fontWeight: 500,
      lineHeight: 1.7,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-input': {
            '& .MuiOutlinedInput-root': {
              borderRadius: 4,
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F5F5F5',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #E0E0E0',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#FAFAFA',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
});

export default theme;
