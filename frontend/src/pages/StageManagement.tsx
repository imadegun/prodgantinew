import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { stageService, StageCategory, ProductionStage } from '../services/stage.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const StageManagement = (): JSX.Element => {
  const [tabValue, setTabValue] = useState(0);
  
  // Categories state
  const [categories, setCategories] = useState<StageCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<StageCategory | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    code: '',
    name: '',
    color: '#4caf50',
    sortOrder: 0,
    isActive: true,
  });
  
  // Stages state
  const [stages, setStages] = useState<ProductionStage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(false);
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<ProductionStage | null>(null);
  const [stageForm, setStageForm] = useState({
    code: '',
    name: '',
    categoryId: 0,
    sortOrder: 0,
    isActive: true,
    requiresOven: false,
    description: '',
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load data when tab changes
  useEffect(() => {
    if (tabValue === 0) {
      loadCategories();
    } else if (tabValue === 1) {
      loadStages();
    }
  }, [tabValue]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await stageService.getCategories();
      setCategories(response);
    } catch (error: any) {
      console.error('Failed to load categories:', error);
      showSnackbar(error.response?.data?.error?.message || 'Failed to load categories', 'error');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const loadStages = async () => {
    setStagesLoading(true);
    try {
      const response = await stageService.getStages();
      setStages(response);
    } catch (error: any) {
      console.error('Failed to load stages:', error);
      showSnackbar(error.response?.data?.error?.message || 'Failed to load stages', 'error');
    } finally {
      setStagesLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Category handlers
  const handleOpenCategoryDialog = (category?: StageCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        code: category.code,
        name: category.name,
        color: category.color,
        sortOrder: category.sortOrder,
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({
        code: '',
        name: '',
        color: '#4caf50',
        sortOrder: 0,
        isActive: true,
      });
    }
    setCategoryDialogOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setCategoryDialogOpen(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await stageService.updateCategory(editingCategory.id, {
          name: categoryForm.name,
          color: categoryForm.color,
          sortOrder: categoryForm.sortOrder,
          isActive: categoryForm.isActive,
        });
        showSnackbar('Category updated successfully', 'success');
      } else {
        await stageService.createCategory({
          code: categoryForm.code,
          name: categoryForm.name,
          color: categoryForm.color,
          sortOrder: categoryForm.sortOrder,
        });
        showSnackbar('Category created successfully', 'success');
      }
      handleCloseCategoryDialog();
      loadCategories();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error?.message || 'Failed to save category', 'error');
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (confirm('Are you sure you want to deactivate this category?')) {
      try {
        await stageService.deleteCategory(categoryId);
        showSnackbar('Category deactivated successfully', 'success');
        loadCategories();
      } catch (error) {
        showSnackbar('Failed to deactivate category', 'error');
      }
    }
  };

  // Stage handlers
  const handleOpenStageDialog = (stage?: ProductionStage) => {
    if (stage) {
      setEditingStage(stage);
      setStageForm({
        code: stage.code,
        name: stage.name,
        categoryId: stage.categoryId,
        sortOrder: stage.sortOrder,
        isActive: stage.isActive,
        requiresOven: stage.requiresOven,
        description: stage.description || '',
      });
    } else {
      setEditingStage(null);
      setStageForm({
        code: '',
        name: '',
        categoryId: categories.length > 0 ? categories[0].id : 0,
        sortOrder: 0,
        isActive: true,
        requiresOven: false,
        description: '',
      });
    }
    setStageDialogOpen(true);
  };

  const handleCloseStageDialog = () => {
    setStageDialogOpen(false);
    setEditingStage(null);
  };

  const handleSaveStage = async () => {
    try {
      if (editingStage) {
        await stageService.updateStage(editingStage.id, {
          name: stageForm.name,
          categoryId: stageForm.categoryId,
          sortOrder: stageForm.sortOrder,
          isActive: stageForm.isActive,
          requiresOven: stageForm.requiresOven,
          description: stageForm.description,
        });
        showSnackbar('Stage updated successfully', 'success');
      } else {
        await stageService.createStage({
          code: stageForm.code,
          name: stageForm.name,
          categoryId: stageForm.categoryId,
          sortOrder: stageForm.sortOrder,
          requiresOven: stageForm.requiresOven,
          description: stageForm.description,
        });
        showSnackbar('Stage created successfully', 'success');
      }
      handleCloseStageDialog();
      loadStages();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error?.message || 'Failed to save stage', 'error');
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    if (confirm('Are you sure you want to deactivate this stage?')) {
      try {
        await stageService.deleteStage(stageId);
        showSnackbar('Stage deactivated successfully', 'success');
        loadStages();
      } catch (error) {
        showSnackbar('Failed to deactivate stage', 'error');
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Stage Management
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Categories" />
          <Tab label="Stages" />
        </Tabs>
      </Box>

      {/* Categories Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Stage Categories</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCategoryDialog()}
              >
                Add Category
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Code</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Color</strong></TableCell>
                    <TableCell><strong>Sort Order</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Stages</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {categoriesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No categories found</TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => (
                      <TableRow key={category.id} hover>
                        <TableCell>
                          <Chip label={category.code} size="small" />
                        </TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: 1,
                              bgcolor: category.color,
                              border: '1px solid #ccc',
                            }}
                          />
                        </TableCell>
                        <TableCell>{category.sortOrder}</TableCell>
                        <TableCell>
                          <Chip 
                            label={category.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={category.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>{category.stages?.length || 0}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenCategoryDialog(category)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteCategory(category.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Category Dialog */}
        <Dialog open={categoryDialogOpen} onClose={handleCloseCategoryDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Code"
                  value={categoryForm.code}
                  onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value.toUpperCase() })}
                  disabled={!!editingCategory}
                  required
                  placeholder="e.g., FORMING, DECOR, DRYING"
                  helperText="Unique identifier for the category (uppercase, no spaces)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  required
                  placeholder="e.g., Forming, Decoration, Drying"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Color"
                  type="color"
                  value={categoryForm.color}
                  onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  value={categoryForm.sortOrder}
                  onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              {editingCategory && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={categoryForm.isActive}
                        onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCategoryDialog}>Cancel</Button>
            <Button onClick={handleSaveCategory} variant="contained">
              {editingCategory ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      {/* Stages Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Production Stages</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenStageDialog()}
                disabled={categories.length === 0}
              >
                Add Stage
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Code</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Sort Order</strong></TableCell>
                    <TableCell><strong>Requires Oven</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stagesLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : stages.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">No stages found</TableCell>
                    </TableRow>
                  ) : (
                    stages.map((stage) => (
                      <TableRow key={stage.id} hover>
                        <TableCell>
                          <Chip label={stage.code} size="small" />
                        </TableCell>
                        <TableCell>{stage.name}</TableCell>
                        <TableCell>
                          <Chip 
                            label={stage.category?.name || 'Unknown'} 
                            size="small" 
                            sx={{ bgcolor: stage.category?.color || '#ccc', color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>{stage.sortOrder}</TableCell>
                        <TableCell>
                          <Chip 
                            label={stage.requiresOven ? 'Yes' : 'No'} 
                            size="small" 
                            color={stage.requiresOven ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={stage.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={stage.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenStageDialog(stage)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteStage(stage.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Stage Dialog */}
        <Dialog open={stageDialogOpen} onClose={handleCloseStageDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingStage ? 'Edit Stage' : 'Add New Stage'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Code"
                  value={stageForm.code}
                  onChange={(e) => setStageForm({ ...stageForm, code: e.target.value.toUpperCase() })}
                  disabled={!!editingStage}
                  required
                  placeholder="e.g., THROWING, TRIMMING, DECORATION"
                  helperText="Unique identifier for the stage (uppercase, no spaces)"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  value={stageForm.name}
                  onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                  required
                  placeholder="e.g., Throwing, Trimming, Decoration"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={stageForm.categoryId}
                    label="Category"
                    onChange={(e) => setStageForm({ ...stageForm, categoryId: Number(e.target.value) })}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Sort Order"
                  type="number"
                  value={stageForm.sortOrder}
                  onChange={(e) => setStageForm({ ...stageForm, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={stageForm.requiresOven}
                      onChange={(e) => setStageForm({ ...stageForm, requiresOven: e.target.checked })}
                    />
                  }
                  label="Requires Oven"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={stageForm.description}
                  onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="Optional description of the stage"
                />
              </Grid>
              {editingStage && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={stageForm.isActive}
                        onChange={(e) => setStageForm({ ...stageForm, isActive: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStageDialog}>Cancel</Button>
            <Button onClick={handleSaveStage} variant="contained">
              {editingStage ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StageManagement;
