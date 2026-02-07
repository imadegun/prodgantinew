import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  Badge,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { fetchAlerts, acknowledgeAlert, resolveAlert } from '../store/slices/alertSlice';

const priorityColors: Record<string, 'error' | 'warning' | 'info' | 'success'> = {
  CRITICAL: 'error',
  WARNING: 'warning',
  INFORMATIONAL: 'info',
};

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  OPEN: 'default',
  ACKNOWLEDGED: 'warning',
  RESOLVED: 'success',
};

const Alerts = () => {
  const dispatch = useAppDispatch();
  const { alerts, isLoading } = useAppSelector((state) => state.alerts);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openResolveDialog, setOpenResolveDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    dispatch(fetchAlerts({ page: page + 1, limit: rowsPerPage, priority: priorityFilter || undefined, status: statusFilter || undefined }));
  }, [dispatch, page, rowsPerPage, priorityFilter, statusFilter]);

  const handleRefresh = () => {
    dispatch(fetchAlerts({ page: 1, limit: rowsPerPage, priority: priorityFilter || undefined, status: statusFilter || undefined }));
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await dispatch(acknowledgeAlert(alertId));
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleOpenResolveDialog = (alert: any) => {
    setSelectedAlert(alert);
    setResolutionNotes(alert.resolutionNotes || '');
    setOpenResolveDialog(true);
  };

  const handleCloseResolveDialog = () => {
    setOpenResolveDialog(false);
    setSelectedAlert(null);
    setResolutionNotes('');
  };

  const handleResolveAlert = async () => {
    try {
      await dispatch(resolveAlert({
        alertId: selectedAlert.alertId,
        resolutionNotes,
      }));
      handleCloseResolveDialog();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getAlertIcon = (alert: any) => {
    switch (alert.priority) {
      case 'CRITICAL':
        return <ErrorIcon />;
      case 'WARNING':
        return <WarningIcon />;
      case 'INFORMATIONAL':
        return <InfoIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const criticalAlerts = alerts.filter((alert) => alert.priority === 'CRITICAL' && alert.status === 'OPEN');
  const warningAlerts = alerts.filter((alert) => alert.priority === 'WARNING' && alert.status === 'OPEN');
  const infoAlerts = alerts.filter((alert) => alert.priority === 'INFORMATIONAL' && alert.status === 'OPEN');

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Alert Center</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Critical
                  </Typography>
                  <Typography variant="h3" color="error">
                    {criticalAlerts.length}
                  </Typography>
                </Box>
                <ErrorIcon fontSize="large" color="error" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Warnings
                  </Typography>
                  <Typography variant="h3" color="warning">
                    {warningAlerts.length}
                  </Typography>
                </Box>
                <WarningIcon fontSize="large" color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="overline">
                    Informational
                  </Typography>
                  <Typography variant="h3" color="info">
                    {infoAlerts.length}
                  </Typography>
                </Box>
                <InfoIcon fontSize="large" color="info" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Priority"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="INFORMATIONAL">Informational</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="OPEN">Open</MenuItem>
                <MenuItem value="ACKNOWLEDGED">Acknowledged</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <FilterIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {alerts.length} alerts found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Priority</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Related POL</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No alerts found
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((alert) => (
                  <TableRow key={alert.alertId} hover>
                    <TableCell>
                      <Chip
                        label={alert.priority}
                        color={priorityColors[alert.priority]}
                        size="small"
                        icon={getAlertIcon(alert)}
                      />
                    </TableCell>
                    <TableCell>{alert.alertType}</TableCell>
                    <TableCell>{alert.alertMessage}</TableCell>
                    <TableCell>{alert.polNumber || '-'}</TableCell>
                    <TableCell>
                      {new Date(alert.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={alert.status}
                        color={statusColors[alert.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {alert.status === 'OPEN' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleAcknowledge(alert.alertId)}
                          title="Acknowledge"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      {alert.status !== 'RESOLVED' && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleOpenResolveDialog(alert)}
                          title="Resolve"
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, alerts.length)} of {alerts.length}
        </Typography>
      </Box>

      {/* Resolve Alert Dialog */}
      <Dialog open={openResolveDialog} onClose={handleCloseResolveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Resolve Alert</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              <strong>Alert Type:</strong> {selectedAlert?.alertType}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Message:</strong> {selectedAlert?.alertMessage}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Created:</strong> {selectedAlert?.createdAt && new Date(selectedAlert.createdAt).toLocaleString()}
            </Typography>
            <TextField
              fullWidth
              label="Resolution Notes"
              multiline
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Enter how this alert was resolved..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResolveDialog}>Cancel</Button>
          <Button onClick={handleResolveAlert} variant="contained">
            Resolve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Alerts;
