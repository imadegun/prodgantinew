import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Alert,
  AlertTitle,
  Skeleton,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { productionService, polService } from '../services/api';
import { POL, POLDetail } from '../types';

const productionStages = [
  { key: 'FORMING', label: 'Forming', stages: ['Throwing', 'Trimming', 'Drying'] },
  { key: 'FIRING', label: 'Firing', stages: ['Load Bisque', 'Out Bisque', 'Load High Firing', 'Out High Firing'] },
  { key: 'GLAZING', label: 'Glazing', stages: ['Sanding', 'Waxing', 'Dipping', 'Spraying', 'Color Decoration'] },
  { key: 'QC', label: 'Quality Control', stages: ['QC - Good', 'QC - Reject'] },
];

const ProductionTracking: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [pols, setPOLs] = useState<POL[]>([]);
  const [selectedPOL, setSelectedPOL] = useState<POL | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<POLDetail | null>(null);
  const [productionData, setProductionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPOLs();
  }, []);

  const fetchPOLs = async () => {
    setLoading(true);
    try {
      const data = await polService.getAll({ status: 'IN_PROGRESS' });
      setPOLs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load POLs');
    } finally {
      setLoading(false);
    }
  };

  const handlePOLChange = async (polId: string) => {
    const pol = pols.find((p) => p.id === polId);
    setSelectedPOL(pol || null);
    setSelectedProduct(null);
    setProductionData([]);
    
    if (pol) {
      // In a real app, we'd fetch the actual production data
      // For now, initialize with empty production records
      setProductionData([
        { stage: 'Throwing', previousQty: 0, currentQty: 0, rejects: 0, notes: '', status: 'pending' },
        { stage: 'Trimming', previousQty: 0, currentQty: 0, rejects: 0, notes: '', status: 'pending' },
        { stage: 'Drying', previousQty: 0, currentQty: 0, rejects: 0, notes: '', status: 'pending' },
      ]);
    }
  };

  const handleProductChange = (productId: string) => {
    const product = selectedPOL?.details?.find((d) => d.id === productId);
    setSelectedProduct(product || null);
  };

  const handleProductionChange = (stage: string, field: string, value: any) => {
    setProductionData((prev) =>
      prev.map((row) =>
        row.stage === stage ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSave = async () => {
    if (!selectedPOL) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      for (const record of productionData) {
        if (record.currentQty > 0 || record.rejects > 0) {
          await productionService.addRecord(Number(selectedPOL.id), {
            stage: record.stage,
            quantity: record.currentQty,
            rejects: record.rejects,
            notes: record.notes,
            userId: user?.id,
          });
        }
      }
      setSuccess('Production data saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save production data');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      case 'delayed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" fontSize="small" />;
      case 'in_progress':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'delayed':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return null;
    }
  };

  const calculateProgress = () => {
    if (productionData.length === 0) return 0;
    const completed = productionData.filter((r) => r.status === 'completed').length;
    return Math.round((completed / productionData.length) * 100);
  };

  if (loading) {
    return (
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
          🏭 Production Tracking
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          🏭 Production Tracking
        </Typography>
        <Tooltip title="Refresh POLs">
          <IconButton onClick={fetchPOLs}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* POL & Product Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Select POL & Product</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>POL</InputLabel>
                <Select
                  value={selectedPOL?.id || ''}
                  label="POL"
                  onChange={(e) => handlePOLChange(e.target.value)}
                >
                  {pols.map((pol) => (
                    <MenuItem key={pol.id} value={pol.id}>
                      {pol.po_number || `PO-${pol.id}`} - {pol.client_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedPOL && selectedPOL.details && selectedPOL.details.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Product</InputLabel>
                  <Select
                    value={selectedProduct?.id || ''}
                    label="Product"
                    onChange={(e) => handleProductChange(e.target.value)}
                  >
                    {selectedPOL.details.map((detail) => (
                      <MenuItem key={detail.id} value={detail.id}>
                        {detail.productCode} - {detail.productName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              {selectedPOL && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">Order Quantity</Typography>
                  <Typography variant="h5">
                    {selectedProduct?.quantity || selectedPOL.total_order || 0}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Production Progress */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Production Progress</Typography>
              
              {!selectedPOL ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  Select a POL to view production progress
                </Typography>
              ) : (
                <>
                  <Stepper alternativeLabel>
                    {productionStages.map((group) => (
                      <Step key={group.key}>
                        <StepLabel>{group.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Overall Progress</Typography>
                      <Typography variant="body2">{calculateProgress()}%</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={calculateProgress()}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Production Data Entry */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Enter Production Data</Typography>
                {selectedPOL && (
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving || productionData.length === 0}
                  >
                    {saving ? 'Saving...' : 'Save Production Data'}
                  </Button>
                )}
              </Box>

              {!selectedPOL ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  Select a POL above to enter production data
                </Typography>
              ) : productionData.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No production stages available
                </Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Stage</TableCell>
                      <TableCell>Previous Qty</TableCell>
                      <TableCell>Current Qty</TableCell>
                      <TableCell>Rejects</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productionData.map((row) => (
                      <TableRow key={row.stage}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getStatusIcon(row.status)}
                            {row.stage}
                          </Box>
                        </TableCell>
                        <TableCell>{row.previousQty}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={row.currentQty}
                            onChange={(e) => handleProductionChange(row.stage, 'currentQty', parseInt(e.target.value) || 0)}
                            sx={{ width: 100 }}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            value={row.rejects}
                            onChange={(e) => handleProductionChange(row.stage, 'rejects', parseInt(e.target.value) || 0)}
                            sx={{ width: 80 }}
                            inputProps={{ min: 0 }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={row.notes}
                            onChange={(e) => handleProductionChange(row.stage, 'notes', e.target.value)}
                            sx={{ width: 200 }}
                            placeholder="Add notes..."
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status.replace('_', ' ')}
                            color={getStatusColor(row.status) as any}
                            size="small"
                            onClick={() => {
                              const nextStatus = {
                                pending: 'in_progress',
                                in_progress: 'completed',
                                completed: 'pending',
                              }[row.status] || 'pending';
                              handleProductionChange(row.stage, 'status', nextStatus);
                            }}
                            clickable
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats */}
        {selectedPOL && productionData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Production Summary</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Total Produced</Typography>
                    <Typography variant="h5">
                      {productionData.reduce((sum, r) => sum + r.currentQty, 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Total Rejects</Typography>
                    <Typography variant="h5" color="error.main">
                      {productionData.reduce((sum, r) => sum + r.rejects, 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Completion Rate</Typography>
                    <Typography variant="h5" color="success.main">
                      {selectedProduct?.quantity
                        ? Math.round(((productionData.reduce((sum, r) => sum + r.currentQty, 0) - productionData.reduce((sum, r) => sum + r.rejects, 0)) / selectedProduct.quantity) * 100)
                        : 0}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Reject Rate</Typography>
                    <Typography variant="h5" color="warning.main">
                      {productionData.reduce((sum, r) => sum + r.currentQty, 0) > 0
                        ? Math.round((productionData.reduce((sum, r) => sum + r.rejects, 0) / productionData.reduce((sum, r) => sum + r.currentQty, 0)) * 100)
                        : 0}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProductionTracking;
