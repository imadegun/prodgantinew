import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Snackbar,
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { fetchPOLById } from '../store/slices/polSlice';
import { useAppDispatch } from '../hooks/useAppSelector';
import { polService } from '../services/pol.service';

interface SearchProduct {
  id: number;
  productCode: string;
  productName: string;
  categoryName: string;
  colorName: string;
  materialName: string;
  sizeName: string;
  textureName: string;
  designCode?: string;
  clientCode?: string;
  photo1?: string;
}

interface Client {
  designCode: string;
  designName: string;
}

const POLDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentPOL, currentPOLDetails, isLoading, error } = useSelector((state: RootState) => state.pol);
  const [activeTab, setActiveTab] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    productCode: '',
    productName: '',
    color: '',
    material: '',
    size: '',
    orderQuantity: 0,
    extraBuffer: 15, // Default 15% extra buffer
    qtyToMake: 0, // Direct qty to make input
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  // Product search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SearchProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  
  // Clients state for getting designCode
  const [clients, setClients] = useState<Client[]>([]);
  const [polDesignCode, setPolDesignCode] = useState<string>('');

  // Load POL data and clients
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLocalLoading(true);
        try {
          const polId = parseInt(id, 10);
          await dispatch(fetchPOLById(polId));
        } catch (err) {
          console.error('Failed to fetch POL details:', err);
        } finally {
          setLocalLoading(false);
        }
      }
    };
    fetchData();
  }, [id, dispatch]);
  
  // Load clients to find designCode for the POL's client
  useEffect(() => {
    const loadClients = async () => {
      try {
        const result = await polService.getClients();
        const clientsList = result?.clients || [];
        setClients(clientsList);
        
        // Find matching client for current POL
        if (currentPOL?.clientName) {
          const matchingClient = clientsList.find(
            (c: Client) => c.designName === currentPOL.clientName
          );
          if (matchingClient) {
            setPolDesignCode(matchingClient.designCode);
            console.log('Found designCode for POL client:', matchingClient.designCode);
          }
        }
      } catch (err) {
        console.error('Failed to load clients:', err);
      }
    };
    
    if (currentPOL) {
      loadClients();
    }
  }, [currentPOL]);

  // Calculate qtyToMake based on quantity and extraBuffer
  const calculateQtyToMake = (quantity: number, extraBuffer: number = 15): number => {
    return Math.ceil(quantity + (quantity * extraBuffer / 100));
  };

  const handleOpenEditDialog = (detail: any) => {
    setSelectedDetail(detail);
    const orderQuantity = detail.orderQuantity || 0;
    const extraBuffer = detail.extraBuffer || 15;
    setEditFormData({
      productCode: detail.productCode || '',
      productName: detail.productName || '',
      color: detail.color || '',
      material: detail.material || '',
      size: detail.size || '',
      orderQuantity: orderQuantity,
      extraBuffer: extraBuffer,
      qtyToMake: calculateQtyToMake(orderQuantity, extraBuffer),
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedDetail(null);
    setEditError(null);
  };

  const handleUpdateDetail = async () => {
    try {
      if (!selectedDetail) {
        setEditError('No product selected');
        return;
      }
      if (editFormData.orderQuantity <= 0) {
        setEditError('Order quantity must be greater than 0');
        return;
      }
      
      // Call API to update POL detail - quantity, extraBuffer, and qtyToMake are editable
      await polService.updatePOLDetail(selectedDetail.id, {
        quantity: editFormData.orderQuantity,
        extraBuffer: editFormData.extraBuffer || 15,
        qtyToMake: editFormData.qtyToMake || 0,
      });

      // Refresh POL data
      if (id) {
        await dispatch(fetchPOLById(parseInt(id, 10)));
      }
      
      handleCloseEditDialog();
      setSuccessMessage('Product updated successfully');
    } catch (err: any) {
      setEditError(err.message || 'Failed to update product. Please try again.');
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      await polService.deletePOLDetail(detailId);
      
      // Refresh POL data
      if (id) {
        await dispatch(fetchPOLById(parseInt(id, 10)));
      }
      
      setSuccessMessage('Product deleted successfully');
    } catch (err: any) {
      setEditError(err.message || 'Failed to delete product. Please try again.');
    }
  };

  const handleOpenAddDialog = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setQuantity(1);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setAddError(null);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedProduct(null);
    setQuantity(1);
  };

  // Search products when dialog opens or search query changes
  const handleSearch = useCallback(async () => {
    if (!polDesignCode) {
      console.warn('No designCode available for POL client');
      return;
    }
    
    setSearchLoading(true);
    try {
      console.log('Searching products with designCode:', polDesignCode);
      const result = await polService.searchProducts(searchQuery || '', 100, polDesignCode);
      setSearchResults(result?.products || []);
    } catch (err) {
      console.error('Failed to search products:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, [polDesignCode, searchQuery]);

  // Trigger search when dialog opens or query changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (openAddDialog) {
        handleSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch, openAddDialog]);

  // Check if product already exists in current POL
  const isProductAlreadyAdded = (product: SearchProduct): boolean => {
    const productCode = product.clientCode || product.productCode;
    return currentPOLDetails.some(
      (detail: any) => detail.productCode === productCode
    );
  };

  const handleSelectProduct = (product: SearchProduct) => {
    // Check if product is already in the list
    if (isProductAlreadyAdded(product)) {
      setAddError(`Product "${product.clientCode || product.productCode}" is already in the order list. Please select a different product.`);
      setSelectedProduct(null);
      return;
    }
    
    setAddError(null);
    setSelectedProduct(product);
  };

  const handleAddProduct = async () => {
    try {
      if (!selectedProduct) {
        setAddError('Please select a product');
        return;
      }

      // Double-check if product already exists
      if (isProductAlreadyAdded(selectedProduct)) {
        setAddError(`Product "${selectedProduct.clientCode || selectedProduct.productCode}" is already in the order list.`);
        return;
      }

      if (quantity <= 0) {
        setAddError('Quantity must be greater than 0');
        return;
      }

      if (!id) {
        setAddError('POL ID not found');
        return;
      }

      await polService.addProductToPOL(parseInt(id, 10), {
        productCode: selectedProduct.clientCode || selectedProduct.productCode,
        productName: selectedProduct.categoryName || selectedProduct.productName,
        color: selectedProduct.colorName,
        material: selectedProduct.materialName,
        size: selectedProduct.sizeName,
        quantity: quantity,
      });

      // Refresh POL data
      await dispatch(fetchPOLById(parseInt(id, 10)));
      
      handleCloseAddDialog();
      setSuccessMessage('Product added successfully');
    } catch (err: any) {
      setAddError(err.message || 'Failed to add product. Please try again.');
    }
  };

  const getStatusColor = (status: string): 'success' | 'info' | 'error' | 'default' => {
    switch (status) {
      case 'IN_PROGRESS': return 'success';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'error';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  const getStageProgress = (stage: string): number => {
    const stages = ['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'];
    const index = stages.indexOf(stage);
    return index >= 0 ? ((index + 1) / stages.length) * 100 : 0;
  };

  if (localLoading || isLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="text" width={300} height={40} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !currentPOL) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'POL not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pols')}>
          Back to POLs
        </Button>
      </Box>
    );
  }

  const details = currentPOLDetails.length > 0 ? currentPOLDetails : [];
  const totalOrderQty = details.reduce((sum: number, d: any) => sum + (d.orderQuantity || 0), 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pols')}>
          Back to POLs
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
          {currentPOL.poNumber || `POL-${currentPOL.id}`} - Detail View
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* POL Information Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>POL Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">PO Number</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{currentPOL.poNumber || `PO-${currentPOL.id}`}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Client</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{currentPOL.clientName || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">PO Date</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {currentPOL.poDate ? new Date(currentPOL.poDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Delivery Date</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {currentPOL.deliveryDate ? new Date(currentPOL.deliveryDate).toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">Status</Typography>
                  <Chip
                    label={currentPOL.status || 'Unknown'}
                    color={getStatusColor(currentPOL.status || '') as any}
                    size="small"
                  />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total Products</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{details.length}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total Order Qty</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{totalOrderQty}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Production Progress Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Production Progress</Typography>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Forming" />
                <Tab label="Firing" />
                <Tab label="Glazing" />
                <Tab label="QC" />
              </Tabs>
              
              {activeTab === 0 && (
                <Box>
                  {['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'].map((stage) => (
                    <Box key={stage} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography>{stage.replace('_', ' ')}</Typography>
                        <Typography>{getStageProgress(stage)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getStageProgress(stage)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {activeTab > 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">{['Forming', 'Firing', 'Glazing', 'Quality Control'][activeTab - 1]} stage details</Typography>
                  <LinearProgress variant="determinate" value={getStageProgress(['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL'][activeTab - 1])} sx={{ mt: 2, height: 10, borderRadius: 5 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Products Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Products</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenAddDialog}
                  size="small"
                >
                  Add Product
                </Button>
              </Box>
              {details.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No products added yet
                </Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Photo</TableCell>
                      <TableCell>Product Code</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Material</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Order Qty</TableCell>
                      <TableCell>Extra Buffer (%)</TableCell>
                      <TableCell>Qty to Make</TableCell>
                      <TableCell>Current Stage</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((detail: any) => (
                      <TableRow key={detail.id}>
                        <TableCell>
                          {detail.photo1 ? (
                            <Box
                              component="img"
                              src={`/uploads/products/${detail.photo1}`}
                              alt={detail.productName || 'Product'}
                              sx={{
                                width: 50,
                                height: 50,
                                objectFit: 'cover',
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider'
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                borderRadius: 1,
                                border: '1px dashed',
                                borderColor: 'divider',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                              }}
                            >
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                                No Photo
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>{detail.productCode || '-'}</TableCell>
                        <TableCell>{detail.productName || '-'}</TableCell>
                        <TableCell>{detail.color || '-'}</TableCell>
                        <TableCell>{detail.material || '-'}</TableCell>
                        <TableCell>{detail.size || '-'}</TableCell>
                        <TableCell>{detail.orderQuantity || 0}</TableCell>
                        <TableCell>{detail.extraBuffer || 15}%</TableCell>
                        <TableCell>
                          <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            minWidth: 100
                          }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                              {detail.qtyToMake || calculateQtyToMake(detail.orderQuantity || 0, detail.extraBuffer || 15)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '10px' }}>
                              {detail.orderQuantity || 0} + {Math.ceil((detail.orderQuantity || 0) * (detail.extraBuffer || 15) / 100)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={detail.currentStage || 'Forming'}
                            size="small"
                            color="success"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="On Track"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleOpenEditDialog(detail)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteDetail(detail.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Alerts</Typography>
              </Box>
              <Typography color="text.secondary">
                No active alerts for this POL
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Edit Product Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Code"
                  value={editFormData.productCode}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={editFormData.productName}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  value={editFormData.color}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Material"
                  value={editFormData.material}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Size"
                  value={editFormData.size}
                  InputProps={{ readOnly: true }}
                />
              </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Order Quantity"
                   type="number"
                   value={editFormData.orderQuantity}
                   onChange={(e) => {
                     const newOrderQuantity = parseInt(e.target.value, 10) || 0;
                     const newQtyToMake = calculateQtyToMake(newOrderQuantity, editFormData.extraBuffer || 15);
                     setEditFormData({ ...editFormData, orderQuantity: newOrderQuantity, qtyToMake: newQtyToMake });
                   }}
                   required
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Extra Buffer (%)"
                   type="number"
                   value={editFormData.extraBuffer || 15}
                   onChange={(e) => {
                     const newExtraBuffer = parseInt(e.target.value) || 15;
                     const newQtyToMake = calculateQtyToMake(editFormData.orderQuantity || 0, newExtraBuffer);
                     setEditFormData({ ...editFormData, extraBuffer: newExtraBuffer, qtyToMake: newQtyToMake });
                   }}
                   inputProps={{ min: 0, max: 100 }}
                   helperText="Extra % added to order quantity"
                 />
               </Grid>
               <Grid item xs={12} sm={6}>
                 <TextField
                   fullWidth
                   label="Qty to Make"
                   type="number"
                   value={editFormData.qtyToMake || 0}
                   InputProps={{
                     readOnly: true,
                     sx: { bgcolor: 'action.hover' }
                   }}
                   helperText={`Auto-calculated: ${editFormData.orderQuantity || 0} + ${Math.ceil((editFormData.orderQuantity || 0) * (editFormData.extraBuffer || 15) / 100)} = ${editFormData.qtyToMake || 0}`}
                 />
               </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleUpdateDetail} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Product Dialog - Search Based */}
      <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Add Product {currentPOL?.clientName ? `- ${currentPOL.clientName}` : ''}
        </DialogTitle>
        <DialogContent>
          {addError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addError}
            </Alert>
          )}
          
          {!polDesignCode && currentPOL?.clientName && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Could not find DesignCode for client "{currentPOL.clientName}". Product search may not work correctly.
            </Alert>
          )}
          
          {/* Search Field */}
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            label="Search by Product Code or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!polDesignCode}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchLoading ? (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ) : null,
            }}
          />

          {/* Selected Product Info */}
          {selectedProduct && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">Selected Product:</Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {selectedProduct.clientCode || selectedProduct.productCode} - {selectedProduct.categoryName || selectedProduct.productName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Color: {selectedProduct.colorName || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Material: {selectedProduct.materialName || '-'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Size: {selectedProduct.sizeName || '-'}
                </Typography>
              </Box>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                sx={{ mt: 2 }}
                inputProps={{ min: 1 }}
              />
            </Box>
          )}
          
          {/* Search Results */}
          {searchResults.length > 0 ? (
            <Table size="small" sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Image</TableCell>
                  <TableCell>Product Code</TableCell>
                  <TableCell>Category/Name</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {searchResults.map((product, index) => {
                  const alreadyAdded = isProductAlreadyAdded(product);
                  const isSelected = selectedProduct?.id === product.id;
                  
                  return (
                    <TableRow
                      key={index}
                      sx={{
                        bgcolor: isSelected ? 'action.selected' : alreadyAdded ? 'action.disabledBackground' : 'inherit',
                        opacity: alreadyAdded ? 0.6 : 1,
                        '&:hover': alreadyAdded ? {} : { bgcolor: 'action.hover' }
                      }}
                    >
                      <TableCell>
                        {product.photo1 ? (
                          <Box
                            component="img"
                            src={`/uploads/products/${product.photo1}`}
                            alt="Product"
                            sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{product.clientCode || product.productCode}</TableCell>
                      <TableCell>{product.categoryName || product.productName}</TableCell>
                      <TableCell>{product.colorName || '-'}</TableCell>
                      <TableCell>{product.materialName || '-'}</TableCell>
                      <TableCell>{product.sizeName || '-'}</TableCell>
                      <TableCell>
                        {alreadyAdded ? (
                          <Chip
                            size="small"
                            color="default"
                            label="Already Added"
                            variant="outlined"
                          />
                        ) : (
                          <Button
                            size="small"
                            variant={isSelected ? "outlined" : "contained"}
                            color={isSelected ? "success" : "primary"}
                            onClick={() => handleSelectProduct(product)}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : !searchLoading && openAddDialog ? (
            <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              {!polDesignCode
                ? 'Cannot load products. Client DesignCode not found.'
                : searchQuery
                  ? 'No products found. Try a different search term.'
                  : 'Type to search for products or view all products for this client.'}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddDialog}>Cancel</Button>
          <Button
            onClick={handleAddProduct}
            variant="contained"
            disabled={!selectedProduct || quantity <= 0}
          >
            Add Product
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={!!successMessage || !!editError}
        autoHideDuration={6000}
        onClose={() => {
          setSuccessMessage(null);
          setEditError(null);
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {successMessage ? (
          <Alert severity="success" icon={<SuccessIcon fontSize="inherit" />}>
            {successMessage}
          </Alert>
        ) : (
          <Alert severity="error">
            {editError}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default POLDetail;
