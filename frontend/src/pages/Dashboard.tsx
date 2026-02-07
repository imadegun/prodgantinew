import React, { useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Add as AddIcon,
  Visibility as VisibilityIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { fetchPOLs } from '../store/slices/polSlice';
import { fetchAlerts } from '../store/slices/alertSlice';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { pols, isLoading: polsLoading } = useAppSelector((state) => state.pol);
  const { alerts, isLoading: alertsLoading } = useAppSelector((state) => state.alerts);

  useEffect(() => {
    dispatch(fetchPOLs({ page: 1, limit: 10 }));
    dispatch(fetchAlerts({ page: 1, limit: 5, status: 'OPEN' }));
  }, [dispatch]);

  const activePOLs = pols.filter((pol) => pol.status === 'IN_PROGRESS');
  const completedPOLs = pols.filter((pol) => pol.status === 'COMPLETED');
  const criticalAlerts = alerts.filter((alert) => alert.priority === 'CRITICAL');

  const handleRefresh = () => {
    dispatch(fetchPOLs({ page: 1, limit: 10 }));
    dispatch(fetchAlerts({ page: 1, limit: 5, status: 'OPEN' }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={polsLoading || alertsLoading}
        >
          Refresh
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Quick Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Total POLs
                  </Typography>
                  <Typography variant="h3">{pols.length}</Typography>
                </Box>
                <Chip
                  label="+12%"
                  color="success"
                  size="small"
                  icon={<TrendingUpIcon />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    In Progress
                  </Typography>
                  <Typography variant="h3">{activePOLs.length}</Typography>
                </Box>
                <Chip
                  label="Active"
                  color="info"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Completed This Month
                  </Typography>
                  <Typography variant="h3">{completedPOLs.length}</Typography>
                </Box>
                <Chip
                  label="+8%"
                  color="success"
                  size="small"
                  icon={<TrendingUpIcon />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Active Alerts
                  </Typography>
                  <Typography variant="h3" color="error">
                    {criticalAlerts.length}
                  </Typography>
                </Box>
                <Chip
                  label="Critical"
                  color="error"
                  size="small"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Active Alerts</Typography>
                <Button size="small" variant="text">
                  View All
                </Button>
              </Box>
              
              {alertsLoading ? (
                <Typography>Loading alerts...</Typography>
              ) : alerts.length === 0 ? (
                <Typography color="textSecondary">No active alerts</Typography>
              ) : (
                alerts.slice(0, 3).map((alert) => (
                  <Box
                    key={alert.alertId}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: 1,
                      borderColor: alert.priority === 'CRITICAL' ? 'error.main' : 'warning.main',
                      borderRadius: 1,
                      backgroundColor: alert.priority === 'CRITICAL' ? 'error.light' : 'warning.light',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {alert.alertType}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {new Date(alert.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                      <Chip
                        label={alert.priority}
                        color={alert.priority === 'CRITICAL' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {alert.alertMessage}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent POLs */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent POLs</Typography>
                <Button size="small" variant="text">
                  View All
                </Button>
              </Box>
              
              {polsLoading ? (
                <Typography>Loading...</Typography>
              ) : pols.length === 0 ? (
                <Typography color="textSecondary">No POLs found</Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>PO Number</TableCell>
                        <TableCell>Client</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pols.slice(0, 5).map((pol) => (
                        <TableRow key={pol.polId} hover>
                          <TableCell>{pol.poNumber}</TableCell>
                          <TableCell>{pol.clientName}</TableCell>
                          <TableCell>
                            <Chip
                              label={pol.status.replace('_', ' ')}
                              color={
                                pol.status === 'COMPLETED' ? 'success' :
                                pol.status === 'IN_PROGRESS' ? 'info' :
                                pol.status === 'CANCELLED' ? 'error' : 'default'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton size="small">
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Production Progress */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Production Progress Overview</Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Forming Stage</Typography>
                  <Typography variant="body2">75%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} color="primary" />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Firing Stage</Typography>
                  <Typography variant="body2">60%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={60} color="secondary" />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Glazing Stage</Typography>
                  <Typography variant="body2">40%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={40} color="success" />
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Quality Control</Typography>
                  <Typography variant="body2">15%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={15} color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          size="large"
        >
          Create New POL
        </Button>
      </Box>
    </Box>
  );
};

export default Dashboard;
