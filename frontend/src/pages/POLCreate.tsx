import { useState } from 'react';
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
} from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon, Delete as DeleteIcon, Search as SearchIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { createPOLSuccess } from '../store/polSlice';
import { polService, productService } from '../services/api';

const steps = ['POL Details', 'Add Products', 'Review & Confirm'];

interface ProductItem {
  id: string;
  productCode: string;
  productName: string;
  color?: string;
  material?: string;
  size?: string;
  quantity: number;
  notes?: string;
}

const POLCreate = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [polDetails, setPolDetails] = useState({
    clientName: '',
    poNumber: '',
    poDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    notes: '',
  });
  
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
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

  const handleNext = () => {
    if (activeStep === 0 && !polDetails.clientName) {
      setError('Please fill in the client name');
      return;
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

  const handleSearchProduct = async () => {
    if (!productSearch.trim()) return;
    setSearching(true);
    try {
      const results = await productService.search(productSearch);
      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search products:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddProduct = (product: any) => {
    const newItem: ProductItem = {
      id: `temp-${Date.now()}`,
      productCode: product.code || product.productCode,
      productName: product.name || product.productName,
      color: product.color,
      material: product.material,
      size: product.size,
      quantity: 1,
    };
    setProducts([...products, newItem]);
    setProductSearch('');
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
        poNumber: polDetails.poNumber || undefined,
        poDate: polDetails.poDate,
        deliveryDate: polDetails.deliveryDate,
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
      
      const created = await polService.create(polData);
      dispatch(createPOLSuccess(created));
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
        <Alert severity="error" sx={{ mb: 3 }}>
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
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={polDetails.clientName}
                    onChange={(e) => setPolDetails({ ...polDetails, clientName: e.target.value })}
                    required
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
              
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search products by code or name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchProduct()}
                />
                <Button variant="outlined" startIcon={<SearchIcon />} onClick={handleSearchProduct} disabled={searching}>
                  Search
                </Button>
              </Box>

              {searchResults.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Search Results:</Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {searchResults.map((product) => (
                      <Chip
                        key={product.code}
                        label={`${product.code} - ${product.name}`}
                        onClick={() => handleAddProduct(product)}
                        onDelete={() => {}}
                        deleteIcon={<AddIcon />}
                        clickable
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
                  Add Custom Product
                </Button>
              </Box>

              {products.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No products added yet. Search and add products above.
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
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Step 3: Review & Confirm</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Client Name</Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>{polDetails.clientName}</Typography>
                  
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
                        <TableCell>Product</TableCell>
                        <TableCell>Quantity</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.productCode} - {product.productName}</TableCell>
                          <TableCell>{product.quantity}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}

              {polDetails.notes && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                  <Typography variant="body2">{polDetails.notes}</Typography>
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
                <Button variant="contained" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Creating...' : 'Create POL'}
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
