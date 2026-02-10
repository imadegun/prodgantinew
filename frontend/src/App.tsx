import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { store } from './store';
import theme from './styles/theme';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POLList from './pages/POLList';
import POLCreate from './pages/POLCreate';
import POLDetail from './pages/POLDetail';
import ProductionTracking from './pages/ProductionTracking';
import Alerts from './pages/AlertCenter';
import Reports from './pages/Reports';
import Logbook from './pages/Logbook';
import Revisions from './pages/RevisionTickets';
import Settings from './pages/Settings';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="pols" element={<POLList />} />
            <Route path="pols/create" element={<POLCreate />} />
            <Route path="pols/:id" element={<POLDetail />} />
            <Route path="production" element={<ProductionTracking />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="reports" element={<Reports />} />
            <Route path="logbook" element={<Logbook />} />
            <Route path="revisions" element={<Revisions />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
