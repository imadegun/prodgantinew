import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent, Grid, Chip, List, ListItem, ListItemText, ListItemIcon, Button, FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert as MuiAlert, AlertTitle, Skeleton, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon, CheckCircle as AcknowledgeIcon, CheckCircle as ResolveIcon, Visibility as ViewIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { fetchAlertsStart, fetchAlertsSuccess, acknowledgeAlertSuccess, resolveAlertSuccess } from '../store/alertSlice';
import { alertService } from '../services/api';
import { Alert } from '../types';

const AlertCenter = (): JSX.Element => {
  const dispatch = useDispatch();
  const { alerts, loading, error } = useSelector((state: RootState) => state.alerts);
  const [activeTab, setActiveTab] = useState(0);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [localLoading, setLocalLoading] = useState(true);
  const [stats, setStats] = useState({ critical: 0, warning: 0, info: 0 });

  useEffect(() => {
    fetchAlertsData();
  }, []);

  const fetchAlertsData = async () => {
    setLocalLoading(true);
    try {
      dispatch(fetchAlertsStart());
      const alertsData = await alertService.getAll();
      dispatch(fetchAlertsSuccess(alertsData));
      const statsData = await alertService.getStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await alertService.acknowledge(Number(alertId));
      dispatch(acknowledgeAlertSuccess({ id: Number(alertId), userId: Number(user?.id) }));
      fetchAlertsData();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolve = async () => {
    if (!selectedAlert) return;
    try {
      await alertService.resolve(Number(selectedAlert.id), resolveNotes);
      dispatch(resolveAlertSuccess({ id: Number(selectedAlert.id), userId: Number(user?.id), notes: resolveNotes }));
      setResolveDialogOpen(false);
      setResolveNotes('');
      setSelectedAlert(null);
      fetchAlertsData();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const openResolveDialog = (alert: Alert) => {
    setSelectedAlert(alert);
    setResolveDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return 'error';
      case 'WARNING':
      case 'MEDIUM':
        return 'warning';
      case 'INFO':
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'error';
      case 'ACKNOWLEDGED':
        return 'warning';
      case 'RESOLVED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getAlertIcon = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
      case 'HIGH':
        return <ErrorIcon color="error" />;
      case 'WARNING':
      case 'MEDIUM':
        return <WarningIcon color="warning" />;
      case 'INFO':
      case 'LOW':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (priorityFilter === 'all') return true;
    return alert.priority === priorityFilter.toUpperCase();
  });

  const openAlerts = filteredAlerts.filter((a) => a.status === 'OPEN');
  const acknowledgedAlerts = filteredAlerts.filter((a) => a.status === 'ACKNOWLEDGED');
  const resolvedAlerts = filteredAlerts.filter((a) => a.status === 'RESOLVED');

  if (localLoading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          🔔 Alert Center
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          🔔 Alert Center
        </Typography>
        <Tooltip title="Refresh Alerts">
          <IconButton onClick={fetchAlertsData}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <MuiAlert severity="error" sx={{ mb: 3 }}>
          {error}
        </MuiAlert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{stats.critical}</Typography>
                  <Typography variant="body2">Critical Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.dark' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>{stats.warning}</Typography>
                  <Typography variant="body2" sx={{ color: 'warning.dark' }}>Warnings</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InfoIcon sx={{ fontSize: 40, color: 'info.dark' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.dark' }}>{stats.info}</Typography>
                  <Typography variant="body2" sx={{ color: 'info.dark' }}>Informational</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Tabs */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
              <Tab label={`Open (${openAlerts.length})`} />
              <Tab label={`Acknowledged (${acknowledgedAlerts.length})`} />
              <Tab label={`Resolved (${resolvedAlerts.length})`} />
            </Tabs>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                label="Priority"
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Alert List */}
          <List>
            {(activeTab === 0 ? openAlerts : activeTab === 1 ? acknowledgedAlerts : resolvedAlerts).length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                No alerts in this category
              </Typography>
            ) : (
              (activeTab === 0 ? openAlerts : activeTab === 1 ? acknowledgedAlerts : resolvedAlerts).map((alert) => (
                <ListItem
                  key={alert.id}
                  sx={{
                    bgcolor: `${getPriorityColor(alert.priority)}.50`,
                    borderRadius: 2,
                    mb: 1,
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getAlertIcon(alert.priority)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {alert.alertMessage || alert.alert_message}
                        <Chip
                          label={alert.priority}
                          color={getPriorityColor(alert.priority) as any}
                          size="small"
                        />
                        <Chip
                          label={alert.status?.replace('_', ' ')}
                          color={getStatusColor(alert.status || '') as any}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" component="span">
                          POL: {alert.polId} | Stage: {alert.stage} | Expected: {alert.expectedQuantity} | Actual: {alert.actualQuantity}
                        </Typography>
                        <br />
                        <Typography variant="body2" component="span">
                          {new Date(alert.createdAt || alert.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {alert.status === 'OPEN' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => setSelectedAlert(alert)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<AcknowledgeIcon />}
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </>
                    )}
                    {alert.status === 'ACKNOWLEDGED' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => setSelectedAlert(alert)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          color="primary"
                          startIcon={<ResolveIcon />}
                          onClick={() => openResolveDialog(alert)}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                    {alert.status === 'RESOLVED' && (
                      <Button
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        View Details
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={Boolean(selectedAlert) && !resolveDialogOpen} onClose={() => setSelectedAlert(null)} maxWidth="sm" fullWidth>
        {selectedAlert && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {getAlertIcon(selectedAlert.priority)}
              Alert Details
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Message</Typography>
                  <Typography>{selectedAlert.alertMessage || selectedAlert.alert_message}</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">POL ID</Typography>
                    <Typography>{selectedAlert.polId}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Stage</Typography>
                    <Typography>{selectedAlert.stage}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Expected Quantity</Typography>
                    <Typography>{selectedAlert.expectedQuantity}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Actual Quantity</Typography>
                    <Typography>{selectedAlert.actualQuantity}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Difference</Typography>
                    <Typography color={selectedAlert.difference < 0 ? 'error.main' : 'success.main'}>
                      {selectedAlert.difference}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Priority</Typography>
                    <Chip
                      label={selectedAlert.priority}
                      color={getPriorityColor(selectedAlert.priority) as any}
                      size="small"
                    />
                  </Grid>
                </Grid>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedAlert.status?.replace('_', ' ')}
                    color={getStatusColor(selectedAlert.status || '') as any}
                    size="small"
                  />
                </Box>
                {selectedAlert.acknowledgedBy && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Acknowledged By</Typography>
                    <Typography>{selectedAlert.acknowledgedBy}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAlert.acknowledgedAt && new Date(selectedAlert.acknowledgedAt).toLocaleString()}
                    </Typography>
                  </Box>
                )}
                {selectedAlert.resolvedBy && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Resolved By</Typography>
                    <Typography>{selectedAlert.resolvedBy}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedAlert.resolvedAt && new Date(selectedAlert.resolvedAt).toLocaleString()}
                    </Typography>
                    {selectedAlert.resolutionNotes && (
                      <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="subtitle2">Resolution Notes</Typography>
                        <Typography>{selectedAlert.resolutionNotes}</Typography>
                      </Box>
                    )}
                  </Box>
                )}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography>{new Date(selectedAlert.createdAt || selectedAlert.created_at).toLocaleString()}</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedAlert(null)}>Close</Button>
              {selectedAlert.status === 'OPEN' && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<AcknowledgeIcon />}
                  onClick={() => handleAcknowledge(selectedAlert.id)}
                >
                  Acknowledge
                </Button>
              )}
              {selectedAlert.status === 'ACKNOWLEDGED' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ResolveIcon />}
                  onClick={() => {
                    setResolveDialogOpen(true);
                  }}
                >
                  Resolve
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={resolveDialogOpen} onClose={() => setResolveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Alert</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Resolution Notes"
            value={resolveNotes}
            onChange={(e) => setResolveNotes(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Describe how the issue was resolved..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleResolve}
            disabled={!resolveNotes.trim()}
          >
            Resolve Alert
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AlertCenter;
