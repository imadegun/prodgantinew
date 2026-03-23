import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert as MuiAlert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Build as BuildIcon,
  LocalFireDepartment as FireIcon,
  Palette as LusterIcon,
  Science as ClayIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { fetchProductionStages, trackProduction } from '../store/slices/productionSlice';
import { fetchPOLs } from '../store/slices/polSlice';
import { fetchActiveProduction } from '../store/slices/productionSlice';
import { productionService } from '../services/production.service';
import { polService } from '../services/pol.service';
import { format } from 'date-fns';

// Stage names mapping
const stageNames: Record<string, string> = {
  THROWING: 'Throwing',
  TRIMMING: 'Trimming',
  DECORATION: 'Decoration',
  DRYING: 'Drying',
  LOAD_BISQUE: 'Load Bisque',
  OUT_BISQUE: 'Out Bisque',
  LOAD_HIGH_FIRING: 'Load High Firing',
  OUT_HIGH_FIRING: 'Out High Firing',
  LOAD_RAKU_FIRING: 'Load Raku Firing',
  OUT_RAKU_FIRING: 'Out Raku Firing',
  LOAD_LUSTER_FIRING: 'Load Luster Firing',
  OUT_LUSTER_FIRING: 'Out Luster Firing',
  SANDING: 'Sanding',
  WAXING: 'Waxing',
  DIPPING: 'Dipping',
  SPRAYING: 'Spraying',
  COLOR_DECORATION: 'Color Decoration',
  QC_GOOD: 'QC Good',
  QC_REJECT: 'QC Reject',
  QC_RE_FIRING: 'QC Re-firing',
  QC_SECOND: 'QC Second',
};

// Category colors
const categoryColors: Record<string, string> = {
  FORMING: '#4caf50',
  DECOR: '#ff9800',
  DRYING: '#9c27b0',
  FIRING: '#f44336',
  GLAZING: '#2196f3',
  QC: '#607d8b',
};

// Stage to category mapping
const getCategoryForStage = (stage: string): string => {
  const formingStages = ['THROWING', 'TRIMMING'];
  const decorStages = ['DECORATION'];
  const dryingStages = ['DRYING'];
  const firingStages = ['LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING'];
  const glazingStages = ['SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION'];
  const qcStages = ['QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];

  if (formingStages.includes(stage)) return 'FORMING';
  if (decorStages.includes(stage)) return 'DECOR';
  if (dryingStages.includes(stage)) return 'DRYING';
  if (firingStages.includes(stage)) return 'FIRING';
  if (glazingStages.includes(stage)) return 'GLAZING';
  if (qcStages.includes(stage)) return 'QC';

  return 'FORMING';
};

// Category labels
const categoryLabels: Record<string, string> = {
  FORMING: 'Forming',
  DECOR: 'Decoration',
  DRYING: 'Drying',
  FIRING: 'Firing',
  GLAZING: 'Glazing',
  QC: 'Quality Control',
};

// Default stages grouped by category (used when workflow not available)
const defaultCategoryStages: Record<string, string[]> = {
  FORMING: ['THROWING', 'TRIMMING'],
  DECOR: ['DECORATION'],
  DRYING: ['DRYING'],
  FIRING: ['LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING'],
  GLAZING: ['SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION'],
  QC: ['QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'],
};

// Firing stages that require oven selection
const firingStages = ['LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING'];

const ProductionTracking = () => {
  const dispatch = useAppDispatch();
  const { pols } = useAppSelector((state) => state.pol);
  
  const [selectedPOL, setSelectedPOL] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [polDetails, setPolDetails] = useState<any[]>([]);
  const [currentStage, setCurrentStage] = useState('THROWING');
  const [currentCategory, setCurrentCategory] = useState('FORMING');
  const [quantity, setQuantity] = useState('');
  const [rejectQuantity, setRejectQuantity] = useState('');
  const [productionDate, setProductionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [discrepancyAlert, setDiscrepancyAlert] = useState<any>(null);
  const [tabValue, setTabValue] = useState('production');
  const [categoryTab, setCategoryTab] = useState(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // New state variables for production tracking features
  const [ovens, setOvens] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [defectReasons, setDefectReasons] = useState<any[]>([]);
  const [productParts, setProductParts] = useState<any[]>([]);
  const [remakeCycles, setRemakeCycles] = useState<any[]>([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [selectedOven, setSelectedOven] = useState('');
  const [selectedDefectReason, setSelectedDefectReason] = useState('');
  const [selectedRemakeType, setSelectedRemakeType] = useState('');
  const [polDetailsData, setPolDetailsData] = useState<any>(null);
  const [productType, setProductType] = useState('');
  const [validationError, setValidationError] = useState('');
  
  // Production records for each stage
  const [stageRecords, setStageRecords] = useState<Record<string, any>>({});
  
  // Production info from MySQL (BuildTech, Clay, Luster, etc.)
  const [productionInfo, setProductionInfo] = useState<any>(null);
  const [productionWorkflow, setProductionWorkflow] = useState<any>(null);
  
  // Add Part Dialog state
  const [addPartDialogOpen, setAddPartDialogOpen] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartType, setNewPartType] = useState('MAIN');
  const [newPartThrowingRequired, setNewPartThrowingRequired] = useState(true);
  const [newPartThrowingOrder, setNewPartThrowingOrder] = useState<number | ''>('');
  
  const categories = ['FORMING', 'DECOR', 'DRYING', 'FIRING', 'GLAZING', 'QC'];
  
  useEffect(() => {
    dispatch(fetchPOLs({ page: 1, limit: 50 }));
    dispatch(fetchActiveProduction());
    loadOvens();
    loadOperators();
    loadDefectReasons();
  }, [dispatch]);

  useEffect(() => {
    if (selectedProduct) {
      loadProductionStages();
      loadProductParts();
      loadRemakeCycles();
    }
  }, [selectedProduct, dispatch]);

  useEffect(() => {
    // Load production info when polDetails is available
    if (selectedProduct && polDetails.length > 0) {
      loadProductionInfo();
    }
  }, [selectedProduct, polDetails, dispatch]);

  const loadProductionStages = async () => {
    try {
      const result = await dispatch(fetchProductionStages(Number(selectedProduct)));
      const payload = result.payload as any;
      if (payload) {
        // Find current stage from records
        const stages = payload.stages as any[];
        let currentStageFound = 'THROWING';
        
        stages.forEach((stageData: any) => {
          if (stageData.records && stageData.records.length > 0) {
            currentStageFound = stageData.stage;
          }
        });
        
        setCurrentStage(currentStageFound);
        setCurrentCategory(getCategoryForStage(currentStageFound));
        
        // Set the category tab
        const categoryIndex = categories.indexOf(getCategoryForStage(currentStageFound));
        if (categoryIndex >= 0) {
          setCategoryTab(categoryIndex);
        }
        
        // Store stage records
        const recordsMap: Record<string, any> = {};
        stages.forEach((stageData: any) => {
          recordsMap[stageData.stage] = stageData;
        });
        setStageRecords(recordsMap);
        
        // Get product type from POL detail
        if (payload.detail) {
          setProductType(payload.detail.productType || 'NORMAL');
          setPolDetailsData(payload.detail);
        }
      }
    } catch (error) {
      console.error('Error loading production stages:', error);
    }
  };

  const loadOvens = async () => {
    try {
      const ovensData = await productionService.getOvens();
      setOvens(ovensData || []);
    } catch (error) {
      console.error('Error loading ovens:', error);
    }
  };

  const loadOperators = async () => {
    try {
      const operatorsData = await productionService.getOperators();
      setOperators(operatorsData || []);
    } catch (error) {
      console.error('Error loading operators:', error);
    }
  };

  const loadDefectReasons = async () => {
    try {
      const reasonsData = await productionService.getDefectReasons();
      setDefectReasons(reasonsData || []);
    } catch (error) {
      console.error('Error loading defect reasons:', error);
    }
  };

  const loadProductParts = async () => {
    try {
      const partsData = await productionService.getProductParts(Number(selectedProduct));
      setProductParts(partsData || []);
    } catch (error) {
      console.error('Error loading product parts:', error);
    }
  };

  const loadRemakeCycles = async () => {
    try {
      const cyclesData = await productionService.getRemakeCycles(Number(selectedProduct));
      setRemakeCycles(cyclesData || []);
    } catch (error) {
      console.error('Error loading remake cycles:', error);
    }
  };

  // Helper function to get product code from various sources
  const getProductCode = (): string | null => {
    // First try to get from polDetailsData (set from backend)
    if (polDetailsData?.productCode) {
      return polDetailsData.productCode;
    }
    
    // Fallback to finding in polDetails array
    const selectedDetail = polDetails.find((d: any) => d.id === Number(selectedProduct));
    if (selectedDetail?.productCode) {
      return selectedDetail.productCode;
    }
    
    return null;
  };

  // Fallback default stages if no workflow is loaded
  const getStagesForCategory = (category: string): string[] => {
    if (productionWorkflow?.stages && productionWorkflow.stages.length > 0) {
      return productionWorkflow.stages.filter((stage: string) => getCategoryForStage(stage) === category);
    }
    return defaultCategoryStages[category] || [];
  };

  const loadProductionInfo = async (): Promise<void> => {
    if (!selectedProduct) return;
    
    const productCode = getProductCode();
    
    if (!productCode) {
      console.warn('Product code not found for POL detail:', selectedProduct, 'polDetailsData:', polDetailsData, 'polDetails:', polDetails);
      return;
    }
    
    try {
      console.log('Loading production info for product code:', productCode);
      
      const [infoData, workflowData]: [any, any] = await Promise.all([
        productionService.getProductProductionInfo(productCode),
        productionService.getProductWorkflow(productCode),
      ]);
      
      console.log('Production Info for', productCode + ':', infoData);
      console.log('Production Workflow for', productCode + ':', workflowData);
      
      setProductionInfo(infoData);
      setProductionWorkflow(workflowData);
      
      // If workflow loaded successfully, update current stage if needed
      if (workflowData?.stages && workflowData.stages.length > 0) {
        const currentCategoryStages = getStagesForCategory(currentCategory);
        if (currentCategoryStages.length > 0 && !currentCategoryStages.includes(currentStage)) {
          setCurrentStage(currentCategoryStages[0]);
        }
      }
    } catch (error) {
      console.error('Error loading production info for', productCode + ':', error);
    }
  };
  const handlePOLChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const polId = event.target.value;
    setSelectedPOL(polId);
    setSelectedProduct('');
    setProductParts([]);
    setRemakeCycles([]);
    setStageRecords({});
    
    if (polId) {
      try {
        const polData = await polService.getPOLById(Number(polId));
        setPolDetails(polData.details || []);
      } catch (error) {
        console.error('Error loading POL details:', error);
        setPolDetails([]);
      }
    } else {
      setPolDetails([]);
    }
  };

  const handleProductChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedProduct(event.target.value);
  };

  const handleCategoryTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCategoryTab(newValue);
    const newCategory = categories[newValue];
    setCurrentCategory(newCategory);
    
    // Set first stage of category as current - use workflow stages if available
    const workflowStages = productionWorkflow?.stages || [];
    const categoryStageList = workflowStages.length > 0 
      ? workflowStages.filter((stage: string) => getCategoryForStage(stage) === newCategory)
      : defaultCategoryStages[newCategory] || [];
    
    if (categoryStageList.length > 0) {
      setCurrentStage(categoryStageList[0]);
    }
  };

  const handleStageSelect = (stage: string) => {
    setCurrentStage(stage);
  };

  // Validate stage quantity based on production flow
  const validateStageQuantity = (stage: string, qty: number, rejectQty: number): { valid: boolean; error?: string } => {
    const orderQty = polDetailsData?.quantity || 0;
    const extraBuffer = polDetailsData?.extraBuffer || 0;
    const qtyToMake = Math.round(orderQty + (orderQty * extraBuffer / 100));
    
    // Get already recorded quantity for this stage
    const currentStageData = stageRecords[stage];
    const alreadyRecordedQty = currentStageData?.totalQuantity || 0;
    const alreadyRecordedRejects = currentStageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0;
    
    // Calculate total after adding new entry (including both good and reject quantities)
    const totalAfterNewEntry = alreadyRecordedQty + qty + alreadyRecordedRejects + rejectQty;
    
    // Define stage flow and validation rules
    const stageFlow = {
      THROWING: { prevStage: null, maxQty: qtyToMake },
      TRIMMING: { prevStage: 'THROWING', useGoodQty: false },
      DECORATION: { prevStage: 'TRIMMING', useGoodQty: true },
      DRYING: { prevStage: 'DECORATION', useGoodQty: true },
      LOAD_BISQUE: { prevStage: 'DRYING', useGoodQty: true },
      OUT_BISQUE: { prevStage: 'LOAD_BISQUE', useGoodQty: true },
      LOAD_HIGH_FIRING: { prevStage: 'OUT_BISQUE', useGoodQty: true },
      OUT_HIGH_FIRING: { prevStage: 'LOAD_HIGH_FIRING', useGoodQty: true },
      LOAD_RAKU_FIRING: { prevStage: 'OUT_HIGH_FIRING', useGoodQty: true },
      OUT_RAKU_FIRING: { prevStage: 'LOAD_RAKU_FIRING', useGoodQty: true },
      LOAD_LUSTER_FIRING: { prevStage: 'OUT_RAKU_FIRING', useGoodQty: true },
      OUT_LUSTER_FIRING: { prevStage: 'LOAD_LUSTER_FIRING', useGoodQty: true },
      SANDING: { prevStage: 'OUT_LUSTER_FIRING', useGoodQty: true },
      WAXING: { prevStage: 'SANDING', useGoodQty: true },
      DIPPING: { prevStage: 'WAXING', useGoodQty: true },
      SPRAYING: { prevStage: 'DIPPING', useGoodQty: true },
      COLOR_DECORATION: { prevStage: 'SPRAYING', useGoodQty: true },
      QC_GOOD: { prevStage: 'COLOR_DECORATION', useGoodQty: true },
      QC_REJECT: { prevStage: 'COLOR_DECORATION', useGoodQty: true },
      QC_RE_FIRING: { prevStage: 'COLOR_DECORATION', useGoodQty: true },
      QC_SECOND: { prevStage: 'COLOR_DECORATION', useGoodQty: true },
    };
    
    const flowConfig = stageFlow[stage as keyof typeof stageFlow];
    
    if (!flowConfig) {
      return { valid: true };
    }
    
    // For THROWING stage, validate against qtyToMake
    if ('maxQty' in flowConfig) {
      const maxQty = flowConfig.maxQty;
      if (totalAfterNewEntry > maxQty) {
        return {
          valid: false,
          error: `Total quantity (${totalAfterNewEntry}) cannot exceed quantity to make (${maxQty}). Already recorded: ${alreadyRecordedQty} good + ${alreadyRecordedRejects} reject, New entry: ${qty} good + ${rejectQty} reject. Order: ${orderQty} + Extra: ${extraBuffer}% = ${maxQty}. Please reduce quantity.`
        };
      }
      return { valid: true };
    }
    
    // For other stages, validate against previous stage's output
    if (flowConfig.prevStage) {
      const prevStageData = stageRecords[flowConfig.prevStage];
      
      if (!prevStageData || prevStageData.totalQuantity === 0) {
        return {
          valid: false,
          error: `Previous stage (${stageNames[flowConfig.prevStage]}) has no recorded quantity. Please complete ${stageNames[flowConfig.prevStage]} first.`
        };
      }
      
      // Calculate previous stage's available quantity
      let prevStageAvailableQty = 0;
      
      if (flowConfig.useGoodQty) {
        // Use good quantity from previous stage (NOT subtracting rejects - rejects are discarded)
        // Use totalRejectQuantity from backend if available, otherwise calculate from records
        prevStageAvailableQty = prevStageData.totalQuantity;
      } else {
        // Use total quantity (good + rejects) from previous stage
        prevStageAvailableQty = prevStageData.totalQuantity;
      }
      
      // Validate - current stage total should not exceed previous stage's available quantity
      if (totalAfterNewEntry > prevStageAvailableQty) {
        return {
          valid: false,
          error: `Total quantity (${totalAfterNewEntry}) cannot exceed available quantity from ${stageNames[flowConfig.prevStage]} (${prevStageAvailableQty} good - rejects are discarded). Already recorded in ${stageNames[stage]}: ${alreadyRecordedQty} good + ${alreadyRecordedRejects} reject, New entry: ${qty} good + ${rejectQty} reject. Please reduce quantity.`
        };
      }
    }
    
    return { valid: true };
  };

  const handleSubmit = async () => {
    try {
      if (!selectedProduct || !quantity || parseInt(quantity) <= 0) {
        showSnackbar('Please select product and enter valid quantity', 'error');
        return;
      }

      // Validate production date is required
      if (!productionDate) {
        showSnackbar('Please select production date', 'error');
        return;
      }

      const qty = parseInt(quantity);
      const rejectQty = parseInt(rejectQuantity) || 0;
      
      // Get dynamic validation based on stage flow
      const validationResult = validateStageQuantity(currentStage, qty, rejectQty);
      if (!validationResult.valid) {
        const errorMessage = validationResult.error || 'Validation failed';
        setValidationError(errorMessage);
        return;
      }

      const result = await dispatch(trackProduction({
        polDetailId: Number(selectedProduct),
        stage: currentStage,
        quantity: qty,
        rejectQuantity: rejectQty,
        category: currentCategory,
        remakeType: selectedRemakeType || undefined,
        ovenId: selectedOven ? Number(selectedOven) : undefined,
        operatorId: selectedOperator ? Number(selectedOperator) : undefined,
        rejectReasonId: selectedDefectReason ? Number(selectedDefectReason) : undefined,
        notes,
        productionDate: productionDate || undefined,
      }));

      const payload = result.payload as any;
      if (payload?.discrepancyDetected) {
        setDiscrepancyAlert(payload);
        showSnackbar('Quantity discrepancy detected', 'warning');
      } else {
        setQuantity('');
        setRejectQuantity('');
        setNotes('');
        setProductionDate('');
        setSelectedOperator('');
        setSelectedOven('');
        setSelectedDefectReason('');
        setSelectedRemakeType('');
        setValidationError('');
        showSnackbar('Production data saved successfully', 'success');
        loadProductionStages();
        loadRemakeCycles();
      }
    } catch (error: any) {
      console.error('Error tracking production:', error);
      showSnackbar(error.message || 'Failed to track production', 'error');
    }
  };

  const handleAlertClose = () => {
    setDiscrepancyAlert(null);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue);
  };

  // Add Part Dialog handlers
  const handleOpenAddPartDialog = () => {
    setAddPartDialogOpen(true);
    setNewPartName('');
    setNewPartType('MAIN');
    setNewPartThrowingRequired(true);
    setNewPartThrowingOrder('');
  };

  const handleCloseAddPartDialog = () => {
    setAddPartDialogOpen(false);
  };

  const handleAddPart = async () => {
    try {
      if (!newPartName) {
        showSnackbar('Please enter part name', 'error');
        return;
      }

      await productionService.createProductPart({
        polDetailId: Number(selectedProduct),
        partName: newPartName,
        partType: newPartType,
        throwingRequired: newPartThrowingRequired,
        throwingOrder: newPartThrowingOrder ? Number(newPartThrowingOrder) : undefined,
      });

      showSnackbar('Product part added successfully', 'success');
      handleCloseAddPartDialog();
      loadProductParts();
    } catch (error: any) {
      console.error('Error adding product part:', error);
      showSnackbar(error.message || 'Failed to add product part', 'error');
    }
  };

  const getCurrentStageData = () => {
    return stageRecords[currentStage] || null;
  };

  const currentStageData = getCurrentStageData();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Production Tracking</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => dispatch(fetchPOLs({ page: 1, limit: 50 }))}
        >
          Refresh
        </Button>
      </Box>
 
      {/* POL and Product Selection */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Select POL</Typography>
              <TextField
                fullWidth
                select
                label="POL"
                value={selectedPOL}
                onChange={handlePOLChange}
                SelectProps={{ native: true }}
              >
                <option value="">Select a POL...</option>
                {pols.map((pol) => (
                  <option key={pol.polId} value={pol.polId}>
                    {pol.poNumber} - {pol.clientName}
                  </option>
                ))}
              </TextField>
            </CardContent>
          </Card>
        </Grid>
 
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Select Product</Typography>
              <TextField
                fullWidth
                select
                label="Product"
                value={selectedProduct}
                onChange={handleProductChange}
                disabled={!selectedPOL}
                SelectProps={{ native: true }}
              >
                <option value="">Select a product...</option>
                {polDetails.map((detail) => (
                  <option key={detail.id} value={detail.id}>
                    {detail.productName} ({detail.productCode}) - Qty: {detail.quantity}
                  </option>
                ))}
              </TextField>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
 
      {/* Product Info Banner */}
      {selectedProduct && (
        <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={2}>
                <Typography variant="body2">
                  <strong>Product Type:</strong> {productType || 'NORMAL'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2">
                  <strong>Category:</strong> 
                  <Chip 
                    label={currentCategory} 
                    size="small" 
                    sx={{ ml: 1, bgcolor: categoryColors[currentCategory], color: 'white' }}
                  />
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2">
                  <strong>Current Stage:</strong> {stageNames[currentStage] || currentStage}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2">
                  <strong>Order Qty:</strong> {polDetailsData?.quantity || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2">
                  <strong>Extra:</strong> {polDetailsData?.extraBuffer || 0}%
                </Typography>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Typography variant="body2" color="primary.main" fontWeight="bold">
                  <strong>Qty to Make:</strong> {polDetailsData?.qtyToMake || 0}
                </Typography>
              </Grid>
            </Grid>
            
            {/* Production Workflow Info */}
            {productionWorkflow && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="primary.main" gutterBottom>
                  <InfoIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Production Workflow
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Workflow:</strong> {productionWorkflow.workflowType}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2">
                      <strong>Firing Type:</strong> {productionWorkflow.firingType || 'Standard'}
                    </Typography>
                  </Grid>
                  {productionWorkflow.skipHighFiring && (
                    <Grid item xs={12} sm={6}>
                      <Chip 
                        icon={<FireIcon />}
                        label="Skip High Firing (Raku Clay)"
                        color="warning"
                        size="small"
                      />
                    </Grid>
                  )}
                  {productionWorkflow.hasLusterFiring && (
                    <Grid item xs={12} sm={6}>
                      <Chip 
                        icon={<LusterIcon />}
                        label="Includes Luster Firing"
                        color="secondary"
                        size="small"
                      />
                    </Grid>
                  )}
                </Grid>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {productionWorkflow.summary}
                </Typography>
              </Box>
            )}
            
            {/* Production Details from MySQL */}
            {productionInfo && (
              <Box sx={{ mt: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  <BuildIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Production Specifications
                </Typography>
                <Grid container spacing={2}>
                  {productionInfo.buildTech && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Build Technique:</strong> {productionInfo.buildTech}
                      </Typography>
                    </Grid>
                  )}
                  {productionInfo.clayDescription && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong><ClayIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />Clay:</strong> {productionInfo.clayDescription}
                        {productionInfo.clayKG && ` (${productionInfo.clayKG} kg)`}
                      </Typography>
                    </Grid>
                  )}
                  {productionInfo.firing && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong><FireIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />Firing:</strong> {productionInfo.firing}
                      </Typography>
                    </Grid>
                  )}
                  {productionInfo.hasLuster && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong><LusterIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 16 }} />Luster:</strong> Yes
                        {productionInfo.lustreTemp && ` (${productionInfo.lustreTemp}°C)`}
                      </Typography>
                    </Grid>
                  )}
                  {(productionInfo.width || productionInfo.height || productionInfo.diameter) && (
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2">
                        <strong>Size:</strong> {[
                          productionInfo.width && `${productionInfo.width}cm W`,
                          productionInfo.height && `${productionInfo.height}cm H`,
                          productionInfo.diameter && `${productionInfo.diameter}cm D`,
                        ].filter(Boolean).join(' x ')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
                {productionInfo.buildTechNote && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Build Notes:</strong> {productionInfo.buildTechNote}
                  </Typography>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}
 
      {/* Main Content Tabs */}
      {selectedProduct && (
        <>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
            <Tab label="Input Production" value="production" />
            <Tab label="Product Parts" value="parts" />
            <Tab label="Remake History" value="remakes" />
          </Tabs>
 
          {/* Production Input Tab */}
          {tabValue === 'production' && (
            <Grid container spacing={3}>
              {/* Left Side - Category Tabs */}
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Production Categories</Typography>
                    <Tabs
                      orientation="vertical"
                      value={categoryTab}
                      onChange={handleCategoryTabChange}
                      variant="fullWidth"
                      sx={{ 
                        '& .MuiTab-root': { 
                          justifyContent: 'flex-start',
                          textAlign: 'left',
                          borderRadius: 1,
                          mb: 0.5,
                        }
                      }}
                    >
                      {categories.map((category, index) => (
                        <Tab 
                          key={category} 
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Chip 
                                label={categoryLabels[category]} 
                                size="small"
                                sx={{ 
                                  bgcolor: categoryColors[category], 
                                  color: 'white',
                                  fontWeight: 'bold',
                                  minWidth: 70
                                }}
                              />
                              <Box sx={{ ml: 'auto' }}>
                                {(productionWorkflow?.stages || defaultCategoryStages[category] || [])?.filter((stage: string) => getCategoryForStage(stage) === category)?.map((stage: string) => {
                                  const stageData = stageRecords[stage];
                                  const totalRejects = stageData?.totalRejectQuantity || stageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0;
                                  if (stageData?.totalQuantity > 0 || totalRejects > 0) {
                                    return (
                                      <Box key={stage} sx={{ display: 'flex', alignItems: 'center', ml: 0.5 }}>
                                        <Chip
                                          label={stageData.totalQuantity}
                                          size="small"
                                          color="success"
                                          sx={{ height: 20, fontSize: '0.7rem' }}
                                        />
                                        {totalRejects > 0 && (
                                          <Chip
                                            label={`-${totalRejects}`}
                                            size="small"
                                            color="error"
                                            sx={{ ml: 0.5, height: 20, fontSize: '0.7rem' }}
                                          />
                                        )}
                                      </Box>
                                    );
                                  }
                                  return null;
                                })}
                              </Box>
                            </Box>
                          }
                          value={index}
                        />
                      ))}
                    </Tabs>
 
                    {/* Stages in selected category */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Stages in {categoryLabels[currentCategory]}:
                      </Typography>
                      <Grid container spacing={1}>
                        {getStagesForCategory(currentCategory).map(stage => {
                          const stageData = stageRecords[stage];
                          const isActive = currentStage === stage;
                          const hasData = stageData?.totalQuantity > 0;
                           
                          return (
                            <Grid item xs={6} key={stage}>
                              <Button
                                fullWidth
                                variant={isActive ? 'contained' : hasData ? 'outlined' : 'text'}
                                color={isActive ? 'primary' : hasData ? 'success' : 'inherit'}
                                onClick={() => handleStageSelect(stage)}
                                size="small"
                                sx={{ 
                                  justifyContent: 'flex-start',
                                  bgcolor: isActive ? categoryColors[currentCategory] : undefined,
                                }}
                              >
                                {stageNames[stage] || stage}
                                {hasData && (
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Chip
                                      label={stageData.totalQuantity}
                                      size="small"
                                      color="success"
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                    {(stageData.totalRejectQuantity || stageData.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) > 0) && (
                                      <Chip
                                        label={`-${stageData.totalRejectQuantity || stageData.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0)}`}
                                        size="small"
                                        color="error"
                                        sx={{ ml: 0.5, height: 20, fontSize: '0.7rem' }}
                                      />
                                    )}
                                  </Box>
                                )}
                              </Button>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
 
              {/* Right Side - Input Form */}
              <Grid item xs={12} md={8}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={categoryLabels[currentCategory]} 
                        sx={{ 
                          bgcolor: categoryColors[currentCategory], 
                          color: 'white',
                          fontWeight: 'bold',
                          mr: 2
                        }}
                      />
                      <Typography variant="h6">
                        {stageNames[currentStage]}
                      </Typography>
                    </Box>
 
                    {/* Current Stage Info */}
                    {(() => {
                      const hasRejects = (currentStageData?.totalRejectQuantity || currentStageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0) > 0;
                      if (!currentStageData || (currentStageData.totalQuantity === 0 && !hasRejects)) return null;
                      return (
                        <Box sx={{ mb: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                          <Typography variant="subtitle2" color="success.main">
                            Already recorded: {currentStageData.totalQuantity} good
                            {hasRejects && (
                              <Typography variant="subtitle2" color="error.main" sx={{ ml: 1 }}>
                                + {currentStageData.totalRejectQuantity || currentStageData.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0)} reject
                              </Typography>
                            )}
                          </Typography>
                          {currentStageData.latestRecord && (
                            <Typography variant="body2" color="text.secondary">
                              Last entry: {format(new Date(currentStageData.latestRecord.createdAt), 'MMM dd, yyyy HH:mm')}
                              {currentStageData.latestRecord.notes && ` - ${currentStageData.latestRecord.notes}`}
                            </Typography>
                          )}
                        </Box>
                      );
                    })()}
 
                    {/* Input Form */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Quantity Produced"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                          size="medium"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Reject Quantity"
                          type="number"
                          value={rejectQuantity}
                          onChange={(e) => setRejectQuantity(e.target.value)}
                          size="medium"
                        />
                      </Grid>
                      
                      {/* Operator Selection */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Operator</InputLabel>
                          <Select
                            value={selectedOperator}
                            onChange={(e) => setSelectedOperator(e.target.value)}
                            label="Operator"
                          >
                            <MenuItem value="">Select Operator...</MenuItem>
                            {operators.map((op) => (
                              <MenuItem key={op.id} value={op.id}>
                                {op.fullName || op.username}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Oven Selection - Only for firing stages */}
                      {firingStages.includes(currentStage) && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Oven</InputLabel>
                            <Select
                              value={selectedOven}
                              onChange={(e) => setSelectedOven(e.target.value)}
                              label="Oven"
                            >
                              <MenuItem value="">Select Oven...</MenuItem>
                              {ovens.filter(o => o.status === 'ACTIVE').map((oven) => (
                                <MenuItem key={oven.id} value={oven.id}>
                                  {oven.ovenCode} - {oven.ovenName}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                      
                      {/* Defect Reason - Show when there are rejects */}
                      {(parseInt(rejectQuantity) > 0 || selectedDefectReason) && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Reject Reason</InputLabel>
                            <Select
                              value={selectedDefectReason}
                              onChange={(e) => setSelectedDefectReason(e.target.value)}
                              label="Reject Reason"
                            >
                              <MenuItem value="">Select Reason...</MenuItem>
                              {defectReasons.map((reason) => (
                                <MenuItem key={reason.id} value={reason.id}>
                                  {reason.category} - {reason.description}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}
                      
                      {/* Remake Type */}
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Production Type</InputLabel>
                          <Select
                            value={selectedRemakeType}
                            onChange={(e) => setSelectedRemakeType(e.target.value)}
                            label="Production Type"
                          >
                            <MenuItem value="">Normal Production</MenuItem>
                            <MenuItem value="RPR">RPR (Pre-Firing Remake)</MenuItem>
                            <MenuItem value="RQC">RQC (Post-Firing Remake)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      
                      {/* Production Date */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Production Date *"
                          type="date"
                          value={productionDate}
                          onChange={(e) => setProductionDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          required
                          error={!productionDate}
                          helperText={!productionDate ? 'Production date is required' : ''}
                        />
                      </Grid>
                      
                      {/* Notes */}
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Notes"
                          multiline
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </Grid>
                      
                      {/* Validation Error Alert */}
                      {validationError && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                          <Typography variant="body2" color="error">
                            {validationError}
                          </Typography>
                        </Box>
                      )}
                      
                      {/* Submit Button */}
                      <Grid item xs={12}>
                        <Button
                          variant="contained"
                          fullWidth
                          size="large"
                          startIcon={<SaveIcon />}
                          onClick={handleSubmit}
                          disabled={!quantity || parseInt(quantity) <= 0 || !productionDate}
                          sx={{ 
                            py: 1.5,
                            bgcolor: categoryColors[currentCategory],
                            '&:hover': {
                              bgcolor: categoryColors[currentCategory],
                              opacity: 0.9,
                            }
                          }}
                        >
                          Save Production Data
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
 
          {/* Product Parts Tab */}
          {tabValue === 'parts' && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Product Parts Breakdown</Typography>
                  <Button size="small" variant="outlined" onClick={handleOpenAddPartDialog}>Add Part</Button>
                </Box>
                {productParts.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Part Name</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Throwing Required</strong></TableCell>
                          <TableCell><strong>Throwing Order</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {productParts.map((part) => (
                          <TableRow key={part.id} hover>
                            <TableCell>{part.partName}</TableCell>
                            <TableCell>
                              <Chip label={part.partType} size="small" />
                            </TableCell>
                            <TableCell>{part.throwingRequired ? 'Yes' : 'No'}</TableCell>
                            <TableCell>{part.throwingOrder || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      No product parts defined yet.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Add parts to track individual component production (e.g., Body, Lid, Handle, Spout).
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
 
          {/* Remake History Tab */}
          {tabValue === 'remakes' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Remake Cycles History</Typography>
                {remakeCycles.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>#</strong></TableCell>
                          <TableCell><strong>Type</strong></TableCell>
                          <TableCell><strong>Stage</strong></TableCell>
                          <TableCell><strong>Qty</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                          <TableCell><strong>Reason</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {remakeCycles.map((cycle) => (
                          <TableRow 
                            key={cycle.id} 
                            hover
                            sx={{ 
                              bgcolor: cycle.status === 'ESCALATED' ? '#ffebee' : 
                                      cycle.status === 'COMPLETED' ? '#e8f5e9' : 'inherit'
                            }}
                          >
                            <TableCell>
                              <Chip label={`R${cycle.remakeNumber}`} size="small" color="primary" />
                            </TableCell>
                            <TableCell>{cycle.remakeType}</TableCell>
                            <TableCell>{cycle.rejectStage || '-'}</TableCell>
                            <TableCell>{cycle.rejectQuantity}</TableCell>
                            <TableCell>
                              <Chip 
                                label={cycle.status} 
                                size="small"
                                color={cycle.status === 'ESCALATED' ? 'error' : 
                                       cycle.status === 'COMPLETED' ? 'success' : 'default'}
                              />
                            </TableCell>
                            <TableCell>{cycle.rejectReason?.category || '-'}</TableCell>
                            <TableCell>
                              {cycle.createdAt ? format(new Date(cycle.createdAt), 'MM/dd/yyyy') : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      No remake cycles recorded.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Select "RPR" or "RQC" as production type when recording rejects to track remakes.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
 
      {/* Discrepancy Alert Dialog */}
      <Dialog open={Boolean(discrepancyAlert)} onClose={handleAlertClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon color="warning" fontSize="large" />
            <Typography variant="h6">Quantity Discrepancy Detected</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <MuiAlert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                {discrepancyAlert?.alertMessage}
              </Typography>
            </MuiAlert>
          </Box>
          
          {discrepancyAlert?.alerts && discrepancyAlert.alerts.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Generated Alerts:</Typography>
              {discrepancyAlert.alerts.map((alert: any, index: number) => (
                <Box
                  key={index}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    backgroundColor: alert.priority === 'CRITICAL' ? '#ffebee' : '#fff3e0',
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {alert.alertType}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {alert.alertMessage}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          
          <DialogActions>
            <Button onClick={handleAlertClose}>Close</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
 
      {/* Snackbar for messages */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity as any} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Add Part Dialog */}
      <Dialog open={addPartDialogOpen} onClose={handleCloseAddPartDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Product Part</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Part Name"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                placeholder="e.g., Body, Lid, Spout, Handle"
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Part Type</InputLabel>
                <Select
                  value={newPartType}
                  onChange={(e) => setNewPartType(e.target.value)}
                  label="Part Type"
                >
                  <MenuItem value="MAIN">Main (Primary Component)</MenuItem>
                  <MenuItem value="SUB">Sub (Additional Component)</MenuItem>
                  <MenuItem value="ASSEMBLY">Assembly (Joined Part)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Throwing Required</InputLabel>
                <Select
                  value={newPartThrowingRequired ? 'Yes' : 'No'}
                  onChange={(e) => setNewPartThrowingRequired(e.target.value === 'Yes')}
                  label="Throwing Required"
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Throwing Order"
                type="number"
                value={newPartThrowingOrder}
                onChange={(e) => setNewPartThrowingOrder(e.target.value ? Number(e.target.value) : '')}
                placeholder="Optional: 1, 2, 3..."
                helperText="Order for multi-part throwing sequence"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddPartDialog}>Cancel</Button>
          <Button onClick={handleAddPart} variant="contained" disabled={!newPartName}>
            Add Part
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionTracking;
