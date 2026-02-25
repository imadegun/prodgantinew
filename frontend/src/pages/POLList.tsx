import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  Grid,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { fetchPOLs, setFilters, deletePOL, updatePOL } from '../store/slices/polSlice';
import { polService } from '../services/pol.service';
import { useAppDispatch } from '../hooks/useAppSelector';

const POLList = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { pols, loading, filters } = useSelector((state: RootState) => state.pol);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPOL, setSelectedPOL] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    clientName: string;
    deliveryDate: string;
    status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  }>({
    clientName: '',
    deliveryDate: '',
    status: 'DRAFT',
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  useEffect(() => {
    dispatch(fetchPOLs({ page: page + 1, limit: rowsPerPage, ...filters }));
  }, [dispatch, filters, page, rowsPerPage]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, pol: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedPOL(pol);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
    setAnchorEl(null);
  };

  const handleConfirmDelete = async () => {
    if (selectedPOL) {
      try {
        const polId = selectedPOL.polId || selectedPOL.id;
        await dispatch(deletePOL(polId));
        setSuccessMessage('POL deleted successfully');
        setOpenDeleteDialog(false);
        setSelectedPOL(null);
      } catch (err: any) {
        setError(err.message || 'Failed to delete POL. Please try again.');
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedPOL(null);
  };

  const handleOpenEditDialog = (pol: any) => {
    setSelectedPOL(pol);
    setEditFormData({
      clientName: pol.clientName,
      deliveryDate: pol.deliveryDate ? pol.deliveryDate.split('T')[0] : '',
      status: pol.status,
    });
    setOpenEditDialog(true);
    setAnchorEl(null);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedPOL(null);
    setError(null);
  };

  const handleUpdatePOL = async () => {
    try {
      if (!selectedPOL) {
        setError('No POL selected');
        return;
      }
      if (!editFormData.clientName || !editFormData.deliveryDate) {
        setError('Please fill in all required fields');
        return;
      }

      const polId = selectedPOL.polId || selectedPOL.id;
      await dispatch(updatePOL({
        id: polId,
        data: {
          clientName: editFormData.clientName,
          deliveryDate: editFormData.deliveryDate,
          status: editFormData.status,
        },
      }));

      handleCloseEditDialog();
      setError(null);
      setSuccessMessage('POL updated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to update POL. Please try again.');
    }
  };

  const getStatusColor = (status: string): 'success' | 'default' | 'info' | 'error' => {
    switch (status) {
      case 'IN_PROGRESS': return 'success';
      case 'PENDING': return 'default';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const filteredPOLs = pols.filter((pol) =>
    (pol.poNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pol.clientName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          POL Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/pols/create')}
        >
          Create New POL
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by PO Number or Client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => dispatch(setFilters({ status: e.target.value }))}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>PO Number</TableCell>
                <TableCell>Client</TableCell>
                <TableCell align="center">Items</TableCell>
                <TableCell>Delivery Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {                filteredPOLs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pol) => (
                  <TableRow key={pol.polId || pol.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {pol.poNumber || `PO-${pol.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>{pol.clientName || '-'}</TableCell>
                    <TableCell align="center">{pol.totalOrder || 0}</TableCell>
                    <TableCell>
                      {pol.deliveryDate
                        ? new Date(pol.deliveryDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={pol.status?.replace('_', ' ')}
                        color={getStatusColor(pol.status || '')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={pol.status === 'COMPLETED' ? 100 : pol.status === 'IN_PROGRESS' ? 50 : 0}
                          sx={{ width: 80, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="caption">
                          {pol.status === 'COMPLETED' ? '100%' : pol.status === 'IN_PROGRESS' ? '50%' : '0%'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, pol)}
                      >
                        <MoreIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredPOLs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No POLs found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredPOLs.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const polId = selectedPOL?.polId || selectedPOL?.id;
          handleMenuClose();
          navigate(`/pols/${polId}`);
        }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleOpenEditDialog(selectedPOL)}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit POL Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit POL</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Client Name</InputLabel>
                  <Select
                    value={editFormData.clientName}
                    label="Client Name"
                    onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                  >
                    {clients.map((client) => (
                      <MenuItem key={client.designCode} value={client.designName}>
                        {client.designName} ({client.designCode})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Delivery Date"
                  type="date"
                  value={editFormData.deliveryDate}
                  onChange={(e) => setEditFormData({ ...editFormData, deliveryDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editFormData.status}
                    label="Status"
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' })}
                  >
                    <MenuItem value="DRAFT">Draft</MenuItem>
                    <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>
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
            Are you sure you want to delete POL <strong>{selectedPOL?.poNumber || `PO-${selectedPOL?.id}`}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!successMessage || !!error}
        autoHideDuration={6000}
        onClose={() => {
          setSuccessMessage(null);
          setError(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {successMessage ? (
          <Alert severity="success" icon={<SuccessIcon fontSize="inherit" />}>
            {successMessage}
          </Alert>
        ) : (
          <Alert severity="error">
            {error}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default POLList;
