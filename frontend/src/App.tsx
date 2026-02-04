import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store';
import { loginSuccess } from './store/authSlice';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POLList from './pages/POLList';
import POLDetail from './pages/POLDetail';
import POLCreate from './pages/POLCreate';
import ProductionTracking from './pages/ProductionTracking';
import AlertCenter from './pages/AlertCenter';
import Reports from './pages/Reports';
import Logbook from './pages/Logbook';
import RevisionTickets from './pages/RevisionTickets';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state: RootState) => state.auth);

  // Check for existing token and restore auth state
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser && !isAuthenticated) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch(loginSuccess({ user: userData, token: storedToken }));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated && !token) {
    return <Login />;
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="pols" element={<POLList />} />
          <Route path="pols/create" element={<POLCreate />} />
          <Route path="pols/:id" element={<POLDetail />} />
          <Route path="production" element={<ProductionTracking />} />
          <Route path="alerts" element={<AlertCenter />} />
          <Route path="reports" element={<Reports />} />
          <Route path="logbook" element={<Logbook />} />
          <Route path="revisions" element={<RevisionTickets />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
