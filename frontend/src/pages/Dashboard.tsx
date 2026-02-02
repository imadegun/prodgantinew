import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Description as POLIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  ArrowForward as ArrowForwardIcon,
  Factory as ProductionIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { dashboardService, alertService } from '../services/api';
import { DashboardStats, Alert as AlertType, POL } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, alertsData] = await Promise.all([
          dashboardService.getStats(),
          alertService.getAll({ status: 'Open', priority: 'Critical' }),
        ]);
        setStats(statsData);
        setAlerts(alertsData.slice(0, 5));
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Pending': return 'warning';
      case 'Delayed': return 'error';
      case 'Completed': return 'info';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Welcome back, {user?.full_name || 'User'}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here's what's happening with your production today.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Total POLs
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.total_pols || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'primary.light', p: 1, borderRadius: 2 }}>
                  <POLIcon sx={{ color: 'primary.main' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <TrendingUpIcon sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +12% from last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats?.active_pols || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'warning.light', p: 1, borderRadius: 2 }}>
                  <ProductionIcon sx={{ color: 'warning.dark' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {stats?.completed_this_month || 0} completed this month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Critical Alerts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {stats?.critical_alerts || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'error.light', p: 1, borderRadius: 2 }}>
                  <ErrorIcon sx={{ color: 'error.main' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <WarningIcon sx={{ color: 'warning.main', fontSize: 20, mr: 0.5 }} />
                <Typography variant="body2" color="warning.main">
                  {stats?.warning_alerts || 0} warnings
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2" gutterBottom>
                    Delayed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                    {stats?.delayed_pols || 0}
                  </Typography>
                </Box>
                <Box sx={{ bgcolor: 'error.light', p: 1, borderRadius: 2 }}>
                  <TrendingDownIcon sx={{ color: 'error.main' }} />
                </Box>
              </Box>
              <Button
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/pols?status=Delayed')}
                sx={{ mt: 1 }}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Critical Alerts */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  🚨 Critical Alerts
                </Typography>
                <Button size="small" onClick={() => navigate('/alerts')}>
                  View All
                </Button>
              </Box>
              {alerts.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">No critical alerts</Typography>
                </Box>
              ) : (
                <List disablePadding>
                  {alerts.map((alert, index) => (
                    <React.Fragment key={alert.id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {alert.priority === 'Critical' ? (
                            <ErrorIcon color="error" />
                          ) : alert.priority === 'Warning' ? (
                            <WarningIcon color="warning" />
                          ) : (
                            <InfoIcon color="info" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={alert.alert_message}
                          secondary={new Date(alert.created_at).toLocaleString()}
                        />
                      </ListItem>
                      {index < alerts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Production Progress */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                📊 Production Progress Overview
              </Typography>
              {stats?.production_progress?.map((stage) => (
                <Box key={stage.stage} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{stage.stage}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {stage.progress}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stage.progress}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ProductionIcon />}
                onClick={() => navigate('/production')}
                sx={{ mt: 2 }}
              >
                View Production Tracking
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                ⚡ Quick Actions
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate('/pols/create')}
                    sx={{ py: 1.5 }}
                  >
                    Create New POL
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/production')}
                    sx={{ py: 1.5 }}
                  >
                    Enter Production Data
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/reports')}
                    sx={{ py: 1.5 }}
                  >
                    Generate Reports
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={() => navigate('/logbook')}
                    sx={{ py: 1.5 }}
                  >
                    Log Issue
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
