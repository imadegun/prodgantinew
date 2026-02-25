import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
  Fab,
  Tooltip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { fetchPOLs, createPOL, updatePOL, deletePOL } from '../store/slices/polSlice';
import { polService } from '../services/pol.service';

const statusColors: Record<string, 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success'> = {
  DRAFT: 'default',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const POLManagement = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pols, isLoading } = useAppSelector((state) => state.pol);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedPOL, setSelectedPOL] = useState<any>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clients, setClients] = useState<Array<{ designCode: string; designName: string }>>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setClientsLoading(true);
    try {
      const result = await polService.getClients();
      setClients(result?.clients || []);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
    } finally {
      setClientsLoading(false);
    }
  };

  // Form state
  const [formData, setFormData] = useState<{
    clientName: string;
    poDate: string;
    deliveryDate: string;
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  }>({
    clientName: '',
    poDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    status: 'DRAFT',
  });

  useEffect(() => {
    dispatch(fetchPOLs({ page: page + 1, limit: rowsPerPage, status: statusFilter || undefined, clientName: searchQuery || undefined }));
  }, [dispatch, page, rowsPerPage, statusFilter, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(0);
  };

  const handleRefresh = () => {
    dispatch(fetchPOLs({ page: page + 1, limit: rowsPerPage, status: statusFilter || undefined, clientName: searchQuery || undefined }));
  };

  const handleOpenCreateDialog = () => {
    setFormData({
      clientName: '',
      poDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      status: 'DRAFT',
    });
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({
      clientName: '',
      poDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      status: 'DRAFT',
    });
  };

  const handleOpenEditDialog = (pol: any) => {
    setSelectedPOL(pol);
    setFormData({
      clientName: pol.clientName,
      poDate: pol.poDate ? pol.poDate.split('T')[0] : '',
      deliveryDate: pol.deliveryDate ? pol.deliveryDate.split('T')[0] : '',
      status: pol.status,
    });
    setOpenEditDialog(true);
    setAnchorEl(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedPOL(null);
  };

  const handleOpenDeleteDialog = (pol: any) => {
    setSelectedPOL(pol);
    setOpenDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPOL(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, pol: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedPOL(pol);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreatePOL = async () => {
    try {
      if (!formData.clientName || !formData.deliveryDate) {
        setErrorMessage('Please fill in all required fields');
        return;
      }

      await dispatch(createPOL({
        clientName: formData.clientName,
        poDate: formData.poDate,
        deliveryDate: formData.deliveryDate,
        products: [],
      }));

      handleCloseCreateDialog();
      handleRefresh();
      setSuccessMessage('POL created successfully');
    } catch (error: any) {
      console.error('Error creating POL:', error);
      setErrorMessage(error.message || 'Failed to create POL. Please try again.');
    }
  };

  const handleUpdatePOL = async () => {
    try {
      if (!selectedPOL) {
        setErrorMessage('No POL selected');
        return;
      }
      if (!formData.clientName || !formData.deliveryDate) {
        setErrorMessage('Please fill in all required fields');
        return;
      }

      const polId = selectedPOL.polId || selectedPOL.id;
      await dispatch(updatePOL({
        id: polId,
        data: {
          clientName: formData.clientName,
          deliveryDate: formData.deliveryDate,
          status: formData.status,
        },
      }));

      handleCloseEditDialog();
      handleRefresh();
      setSuccessMessage('POL updated successfully');
    } catch (error: any) {
      console.error('Error updating POL:', error);
      setErrorMessage(error.message || 'Failed to update POL. Please try again.');
    }
  };

  const handleDeletePOL = async () => {
    try {
      if (!selectedPOL) {
        setErrorMessage('No POL selected');
        return;
      }
      const polId = selectedPOL.polId || selectedPOL.id;
      await dispatch(deletePOL(polId));
      handleCloseDeleteDialog();
      handleRefresh();
      setSuccessMessage('POL deleted successfully');
    } catch (error: any) {
      console.error('Error deleting POL:', error);
      setErrorMessage(error.message || 'Failed to delete POL. Please try again.');
    }
  };

  const handleViewDetail = (pol: any) => {
    handleMenuClose();
    navigate(`/pols/${pol.polId || pol.id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">POL Management</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create POL
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by client name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                InputProps={{
                  startAdornment: <FilterIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                <FilterIcon sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {pols.length} POLs found
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* POL List */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PO Number</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell align="right">Items</TableCell>
                <TableCell>PO Date</TableCell>
                <TableCell>Delivery Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : pols.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No POLs found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                pols.map((pol) => (
                  <TableRow key={pol.id} hover>
                    <TableCell>{pol.poNumber}</TableCell>
                    <TableCell>{pol.clientName}</TableCell>
                    <TableCell align="right">{pol.totalOrder || 0}</TableCell>
                    <TableCell>
                      {pol.poDate ? new Date(pol.poDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {pol.deliveryDate ? new Date(pol.deliveryDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pol.status.replace('_', ' ')}
                        color={statusColors[pol.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Actions">
                        <IconButton size="small" onClick={(e) => handleMenuOpen(e, pol)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl) && selectedPOL?.polId === pol.polId}
                        onClose={handleMenuClose}
                      >
                        <MenuItem onClick={() => handleViewDetail(pol)}>
                          <VisibilityIcon fontSize="small" sx={{ mr: 1 }} />
                          View Details
                        </MenuItem>
                        <MenuItem onClick={() => handleOpenEditDialog(pol)}>
                          <EditIcon fontSize="small" sx={{ mr: 1 }} />
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleOpenDeleteDialog(pol)}>
                          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                          Delete
                        </MenuItem>
                      </Menu>
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
          Showing {page * rowsPerPage + 1}-{Math.min((page + 1) * rowsPerPage, pols.length)} of {pols.length}
        </Typography>
      </Box>

      {/* Create POL Dialog */}
      <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="md" fullWidth>
        <DialogTitle>Create New POL</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Client Name</InputLabel>
                  <Select
                    value={formData.clientName}
                    label="Client Name"
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.designCode} value={client.designName}>
                        {client.designName} ({client.designCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PO Date"
                  type="date"
                  value={formData.poDate}
                  onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Delivery Date"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' })}
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Cancel</Button>
          <Button onClick={handleCreatePOL} variant="contained">
            Create POL
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit POL Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit POL</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Client Name</InputLabel>
                  <Select
                    value={formData.clientName}
                    label="Client Name"
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.designCode} value={client.designName}>
                        {client.designName} ({client.designCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="PO Date"
                  type="date"
                  value={formData.poDate}
                  onChange={(e) => setFormData({ ...formData, poDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Delivery Date"
                  type="date"
                  value={formData.deliveryDate}
                  onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' })}
                >
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdatePOL} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete POL <strong>{selectedPOL?.poNumber || selectedPOL?.polId}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeletePOL} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!successMessage || !!errorMessage}
        autoHideDuration={6000}
        onClose={() => {
          setSuccessMessage(null);
          setErrorMessage(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {successMessage ? (
          <Alert severity="success" icon={<SuccessIcon fontSize="inherit" />}>
            {successMessage}
          </Alert>
        ) : (
          <Alert severity="error">
            {errorMessage}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default POLManagement;
