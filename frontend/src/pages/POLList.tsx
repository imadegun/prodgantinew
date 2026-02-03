import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  Select,
  Grid,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { fetchPOLsStart, fetchPOLsSuccess, setFilters, deletePOLSuccess } from '../store/polSlice';
import { polService } from '../services/api';
import { POL } from '../types';

const POLList = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pols, loading, filters } = useSelector((state: RootState) => state.pol);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPOL, setSelectedPOL] = useState<POL | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPOLs = async () => {
      dispatch(fetchPOLsStart());
      try {
        const data = await polService.getAll(filters);
        dispatch(fetchPOLsSuccess(data));
      } catch (error: any) {
        console.error('Failed to fetch POLs:', error);
      }
    };
    fetchPOLs();
  }, [dispatch, filters]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, pol: POL) => {
    setAnchorEl(event.currentTarget);
    setSelectedPOL(pol);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPOL(null);
  };

  const handleDelete = async () => {
    if (selectedPOL) {
      try {
        await polService.delete(Number(selectedPOL.id));
        dispatch(deletePOLSuccess(selectedPOL.id));
      } catch (error) {
        console.error('Failed to delete POL:', error);
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status: string): 'success' | 'default' | 'info' | 'error' => {
    switch (status) {
      case 'IN_PROGRESS': return 'success';
      case 'DRAFT': return 'default';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const filteredPOLs = pols.filter((pol) =>
    (pol.po_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pol.client_name || '').toLowerCase().includes(searchTerm.toLowerCase())
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
                  <MenuItem value="DRAFT">Draft</MenuItem>
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
              {filteredPOLs
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pol) => (
                  <TableRow key={pol.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {pol.po_number || `PO-${pol.id}`}
                      </Typography>
                    </TableCell>
                    <TableCell>{pol.client_name || pol.customerName || '-'}</TableCell>
                    <TableCell align="center">{pol.total_order || 0}</TableCell>
                    <TableCell>
                      {pol.delivery_date || pol.deliveryDate
                        ? new Date(pol.delivery_date || pol.deliveryDate || '').toLocaleDateString()
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
        <MenuItem onClick={() => { navigate(`/pols/${selectedPOL?.id}`); handleMenuClose(); }}>
          <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { navigate(`/pols/${selectedPOL?.id}/edit`); handleMenuClose(); }}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default POLList;
