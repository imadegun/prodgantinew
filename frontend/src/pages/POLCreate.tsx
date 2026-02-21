import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Add as AddIcon, 
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { createPOL, fetchPOLs } from '../store/slices/polSlice';
import { polService } from '../services/pol.service';

const steps = ['POL Details', 'Add Products', 'Review & Confirm'];

interface Client {
  designCode: string;
  designName: string;
}

interface ProductItem {
  id: string;
  productCode: string;
  productName: string;
  clientCode?: string;
  color?: string;
  material?: string;
  size?: string;
  quantity: number;
  notes?: string;
}

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

const POLCreate = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Client selection state
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Product search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  
  const [polDetails, setPolDetails] = useState({
    clientName: '',
    clientCode: '',
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    description: '',
    notes: '',
  });
  
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<ProductItem>>({
    productCode: '',
    productName: '',
    color: '',
    material: '',
    size: '',
    quantity: 1,
    notes: '',
  });

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setClientsLoading(true);
    setError(null);
    try {
      const result = await polService.getClients();
      console.log('Clients loaded:', result);
      setClients(result?.clients || []);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
      const errorMsg = err.response?.data?.error?.message || err.message || 'Failed to load clients';
      setError('Cannot load clients: ' + errorMsg);
    } finally {
      setClientsLoading(false);
    }
  };

  // Search products when client is selected and search query changes
  const handleSearch = useCallback(async () => {
    if (!selectedClient) return;
    
    setSearchLoading(true);
    try {
      const designCode = selectedClient?.designCode;
      // Load all products for the client if no search query
      const result = await polService.searchProducts(searchQuery || '', 100, designCode);
      setSearchResults(result?.products || []);
    } catch (err) {
      console.error('Failed to search products:', err);
    } finally {
      setSearchLoading(false);
    }
  }, [selectedClient, searchQuery]);

  // Debounced search - also triggers when dialog opens
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchDialogOpen && selectedClient) {
        handleSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch, searchDialogOpen, selectedClient]);

  const handleClientChange = (event: any, newValue: Client | null) => {
    setSelectedClient(newValue);
    setPolDetails({
      ...polDetails,
      clientName: newValue?.designName || '',
      clientCode: newValue?.designCode || '',
    });
    // Clear products when client changes since they're specific to client
    setProducts([]);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!selectedClient) {
        setError('Please select a Client');
        return;
      }
      if (!polDetails.deliveryDate) {
        setError('Please select a Delivery Date');
        return;
      }
    }
    if (activeStep === 1 && products.length === 0) {
      setError('Please add at least one product');
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSearchProduct = (product: SearchProduct) => {
    const newItem: ProductItem = {
      id: `temp-${Date.now()}`,
      productCode: product.clientCode || product.productCode,
      productName: product.categoryName || product.productName,
      clientCode: product.clientCode,
      color: product.colorName,
      material: product.materialName,
      size: product.sizeName,
      quantity: 1,
    };
    setProducts([...products, newItem]);
    setSearchDialogOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleAddCustomProduct = () => {
    if (!newProduct.productCode || !newProduct.productName) return;
    const newItem: ProductItem = {
      id: `temp-${Date.now()}`,
      ...newProduct,
    } as ProductItem;
    setProducts([...products, newItem]);
    setAddDialogOpen(false);
    setNewProduct({
      productCode: '',
      productName: '',
      color: '',
      material: '',
      size: '',
      quantity: 1,
      notes: '',
    });
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setProducts(products.map((p) => (p.id === id ? { ...p, quantity: Math.max(1, quantity) } : p)));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const polData = {
        clientName: polDetails.clientName,
        clientCode: polDetails.clientCode,
        poNumber: polDetails.poNumber || undefined,
        poDate: polDetails.poDate,
        deliveryDate: polDetails.deliveryDate,
        description: polDetails.description,
        notes: polDetails.notes,
        products: products.map((p) => ({
          productCode: p.productCode,
          productName: p.productName,
          color: p.color,
          material: p.material,
          size: p.size,
          orderQuantity: p.quantity,
          notes: p.notes,
        })),
      };
      
      const result = await dispatch(createPOL(polData));
      if (createPOL.rejected.match(result)) {
        throw new Error(result.payload as string || 'Failed to create POL');
      }
      // Refresh the POL list after successful creation
      dispatch(fetchPOLs({ page: 1, limit: 10 }));
      navigate('/pols');
    } catch (err: any) {
      setError(err.message || 'Failed to create POL');
    } finally {
      setLoading(false);
    }
  };

  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pols')}>
          Back to POLs
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
          Create New POL
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          {activeStep === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Step 1: POL Details</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={clients}
                    loading={clientsLoading}
                    getOptionLabel={(option) => `${option.designName} (${option.designCode})`}
                    value={selectedClient}
                    onChange={handleClientChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Client"
                        required
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {clientsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    isOptionEqualToValue={(option, value) => option.designCode === value.designCode}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="PO Number"
                    value={polDetails.poNumber}
                    onChange={(e) => setPolDetails({ ...polDetails, poNumber: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="PO Date"
                    value={polDetails.poDate}
                    onChange={(e) => setPolDetails({ ...polDetails, poDate: e.target.value })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Delivery Date"
                    value={polDetails.deliveryDate}
                    onChange={(e) => setPolDetails({ ...polDetails, deliveryDate: e.target.value })}
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={polDetails.description}
                    onChange={(e) => setPolDetails({ ...polDetails, description: e.target.value })}
                    placeholder="Enter POL description"
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={polDetails.notes}
                    onChange={(e) => setPolDetails({ ...polDetails, notes: e.target.value })}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Step 2: Add Products</Typography>
              
              {!selectedClient ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Please select a client first to view their products.
                </Alert>
              ) : (
                <>
                  <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<SearchIcon />} 
                      onClick={() => setSearchDialogOpen(true)}
                    >
                      Search Products
                    </Button>
                    <Button 
                      variant="outlined" 
                      startIcon={<AddIcon />} 
                      onClick={() => setAddDialogOpen(true)}
                    >
                      Add Custom Product
                    </Button>
                  </Box>

                  {products.length === 0 ? (
                    <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                      No products added yet. Search or add products above.
                    </Typography>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product Code</TableCell>
                          <TableCell>Product Name</TableCell>
                          <TableCell>Color</TableCell>
                          <TableCell>Material</TableCell>
                          <TableCell>Size</TableCell>
                          <TableCell>Quantity</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>{product.productCode}</TableCell>
                            <TableCell>{product.productName}</TableCell>
                            <TableCell>{product.color || '-'}</TableCell>
                            <TableCell>{product.material || '-'}</TableCell>
                            <TableCell>{product.size || '-'}</TableCell>
                            <TableCell>
                              <TextField
                                type="number"
                                size="small"
                                value={product.quantity}
                                onChange={(e) => handleUpdateQuantity(product.id, parseInt(e.target.value) || 1)}
                                sx={{ width: 80 }}
                                inputProps={{ min: 1 }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton size="small" color="error" onClick={() => handleRemoveProduct(product.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}

                  {products.length > 0 && (
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Typography variant="subtitle1">
                        Total Quantity: <strong>{totalQuantity}</strong>
                      </Typography>
                    </Box>
                  )}
                </>
              )}
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Step 3: Review & Confirm</Typography>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                Please review all details below before creating the POL. Click "Confirm & Create" to save to database.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Client</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {selectedClient?.designName} ({selectedClient?.designCode})
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">PO Number</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {polDetails.poNumber || <Chip label="Auto-generated" size="small" />}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">PO Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{polDetails.poDate}</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Delivery Date</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{polDetails.deliveryDate}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {polDetails.description || '-'}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Total Products</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{products.length} types</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Total Quantity</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{totalQuantity} units</Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                  <Typography variant="body1">{user?.fullName || 'Unknown'}</Typography>
                </Grid>
              </Grid>

              {products.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Products Summary:</Typography>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product Code</TableCell>
                        <TableCell>Product Name</TableCell>
                        <TableCell>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.productCode}</TableCell>
                          <TableCell>{product.productName}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {(polDetails.description || polDetails.notes) && (
                <Box sx={{ mt: 3 }}>
                  {polDetails.description && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>{polDetails.description}</Typography>
                    </>
                  )}
                  {polDetails.notes && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                      <Typography variant="body2">{polDetails.notes}</Typography>
                    </>
                  )}
                </Box>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button 
                  variant="contained" 
                  onClick={handleSubmit} 
                  disabled={loading}
                  color="success"
                  size="large"
                >
                  {loading ? 'Creating...' : 'Confirm & Create POL'}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Product Search Dialog */}
      <Dialog 
        open={searchDialogOpen} 
        onClose={() => setSearchDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Search Products for {selectedClient?.designName}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            autoFocus
            margin="dense"
            label="Search by Product Code or Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                {searchResults.map((product, index) => (
                  <TableRow key={index}>
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
                      <Button 
                        size="small" 
                        variant="contained"
                        onClick={() => handleSearchProduct(product)}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : !searchLoading && searchDialogOpen ? (
            <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              {searchQuery ? 'No products found. Try a different search term.' : 'No products available for this client.'}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSearchDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Custom Product Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Custom Product</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Code"
                value={newProduct.productCode}
                onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Product Name"
                value={newProduct.productName}
                onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Color"
                value={newProduct.color || ''}
                onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Material"
                value={newProduct.material || ''}
                onChange={(e) => setNewProduct({ ...newProduct, material: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Size"
                value={newProduct.size || ''}
                onChange={(e) => setNewProduct({ ...newProduct, size: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={newProduct.notes || ''}
                onChange={(e) => setNewProduct({ ...newProduct, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCustomProduct}>Add Product</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default POLCreate;
