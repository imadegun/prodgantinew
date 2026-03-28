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
  Paper,
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
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
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
  QC_GOOD: 'Good',
  QC_REJECT: 'Reject',
  QC_RE_FIRING: 'BU',
  QC_SECOND: 'Second',
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
  QC: 'QC',
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
  const [tabValue, setTabValue] = useState('part-production');
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
  
  // Edit Part Dialog state
  const [editPartDialogOpen, setEditPartDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<any>(null);
  const [editPartName, setEditPartName] = useState('');
  const [editPartType, setEditPartType] = useState('MAIN');
  const [editPartThrowingRequired, setEditPartThrowingRequired] = useState(true);
  const [editPartThrowingOrder, setEditPartThrowingOrder] = useState<number | ''>('');
  const [editPartLinkedToPartId, setEditPartLinkedToPartId] = useState<number | null>(null);
  
  // Part Production Tracking state
  const [selectedPart, setSelectedPart] = useState<any>(null);
  const [partStages, setPartStages] = useState<any[]>([]);
  const [partCurrentStage, setPartCurrentStage] = useState('');
  const [partCurrentCategory, setPartCurrentCategory] = useState('FORMING');
  const [partQuantity, setPartQuantity] = useState('');
  const [partRejectQuantity, setPartRejectQuantity] = useState('');
  const [partProductionDate, setPartProductionDate] = useState('');
  const [partNotes, setPartNotes] = useState('');
  const [partSelectedOperator, setPartSelectedOperator] = useState('');
  const [partSelectedOven, setPartSelectedOven] = useState('');
  const [partSelectedDefectReason, setPartSelectedDefectReason] = useState('');
  const [partSelectedRemakeType, setPartSelectedRemakeType] = useState('');
  const [partValidationError, setPartValidationError] = useState('');
  const [partStageRecords, setPartStageRecords] = useState<Record<string, any>>({});
  
  // Auto-dismiss validation error after 5 seconds
  useEffect(() => {
    if (partValidationError) {
      const timer = setTimeout(() => {
        setPartValidationError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [partValidationError]);
  
  // Combine Parts state
  const [combineDialogOpen, setCombineDialogOpen] = useState(false);
  const [combineStage, setCombineStage] = useState('');
  const [combineCategory, setCombineCategory] = useState('FORMING');
  const [selectedPartsForCombine, setSelectedPartsForCombine] = useState<Record<string, number>>({});
  const [combineNotes, setCombineNotes] = useState('');
  const [combineLoading, setCombineLoading] = useState(false);
  const [partCombinations, setPartCombinations] = useState<any[]>([]);
  
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
      // Clear previous product's data when switching products
      setSelectedPart(null);
      setPartStages([]);
      setPartStageRecords({});
      setPartCurrentStage('');
      setPartCurrentCategory('FORMING');
      
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

  // Auto-load part combinations when combine tab is selected
  useEffect(() => {
    if (tabValue === 'combine-parts' && selectedProduct) {
      loadPartCombinations();
    }
  }, [tabValue, selectedProduct]);

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
      
      // Auto-create default MAIN part if no parts exist
      if (!partsData || partsData.length === 0) {
        try {
          const defaultPart = await productionService.createProductPart({
            polDetailId: Number(selectedProduct),
            partName: 'Main',
            partType: 'MAIN',
            throwingRequired: true,
            throwingOrder: 1,
          });
          
          // Reload parts after creating default
          const refreshedParts = await productionService.getProductParts(Number(selectedProduct));
          setProductParts(refreshedParts || []);
          
          // Auto-select the default part and load its stage data
          if (refreshedParts && refreshedParts.length > 0) {
            await handlePartSelect(refreshedParts[0]);
          }
          
          showSnackbar('Default part created automatically. Start tracking production!', 'info');
        } catch (createError) {
          console.error('Error creating default part:', createError);
          setProductParts(partsData || []);
        }
      } else {
        setProductParts(partsData);
        
        // Auto-select first part and load stage data if no part is currently selected
        if (partsData.length > 0 && !selectedPart) {
          await handlePartSelect(partsData[0]);
        }
      }
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

   const handleOpenEditPartDialog = (part: any) => {
     setEditingPart(part);
     setEditPartName(part.partName);
     setEditPartType(part.partType);
     setEditPartThrowingRequired(part.throwingRequired);
     setEditPartThrowingOrder(part.throwingOrder || '');
     setEditPartLinkedToPartId(part.linkedToPartId || null);
     setEditPartDialogOpen(true);
   };

   const handleCloseEditPartDialog = () => {
     setEditPartDialogOpen(false);
     setEditingPart(null);
   };

   const handleUpdatePart = async () => {
     try {
       if (!editPartName) {
         showSnackbar('Please enter part name', 'error');
         return;
       }

       await productionService.updateProductPart(editingPart.id, {
         partName: editPartName,
         partType: editPartType,
         linkedToPartId: editPartLinkedToPartId === null ? undefined : editPartLinkedToPartId,
         throwingRequired: editPartThrowingRequired,
         throwingOrder: editPartThrowingOrder ? Number(editPartThrowingOrder) : undefined,
       });

       showSnackbar('Product part updated successfully', 'success');
       handleCloseEditPartDialog();
       loadProductParts();
     } catch (error: any) {
       console.error('Error updating product part:', error);
       showSnackbar(error.message || 'Failed to update product part', 'error');
     }
   };

   const handleDeletePart = async (partId: number) => {
     if (confirm('Are you sure you want to delete this part?')) {
       try {
         await productionService.deleteProductPart(partId);
         showSnackbar('Product part deleted successfully', 'success');
         loadProductParts();
       } catch (error: any) {
         console.error('Error deleting product part:', error);
         showSnackbar(error.message || 'Failed to delete product part', 'error');
       }
     }
   };

  // Part Production Tracking handlers
  const handlePartSelect = async (part: any) => {
    setSelectedPart(part);
    setPartCurrentStage('');
    setPartCurrentCategory('FORMING');
    setPartStageRecords({});
    
    if (part) {
      try {
        const result = await productionService.getPartProductionStages(part.id);
        console.log('Loaded part production stages for part', part.id, ':', result);
        if (result) {
          setPartStages(result.stages || []);
          
          // Find current stage from records
          let currentStageFound = 'THROWING';
          result.stages?.forEach((stageData: any) => {
            if (stageData.records && stageData.records.length > 0) {
              currentStageFound = stageData.stage;
            }
          });
          
          setPartCurrentStage(currentStageFound);
          setPartCurrentCategory(getCategoryForStage(currentStageFound));
          
          // Store stage records
          const recordsMap: Record<string, any> = {};
          result.stages?.forEach((stageData: any) => {
            recordsMap[stageData.stage] = stageData;
          });
          setPartStageRecords(recordsMap);
        }
      } catch (error) {
        console.error('Error loading part production stages:', error);
      }
    }
  };

  const handlePartCategoryTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    const newCategory = categories[newValue];
    setPartCurrentCategory(newCategory);
    
    // Set first stage of category as current
    const categoryStageList = getStagesForCategory(newCategory);
    if (categoryStageList.length > 0) {
      setPartCurrentStage(categoryStageList[0]);
    }
  };

  const handlePartStageSelect = (stage: string) => {
    setPartCurrentStage(stage);
  };

  const validatePartStageQuantity = (stage: string, qty: number, rejectQty: number): { valid: boolean; error?: string } => {
    if (!selectedPart) return { valid: false, error: 'No part selected' };
    
    // Get the part's target quantity - use qtyToMake (order + extra buffer) like Input Production
    const orderQty = polDetailsData?.quantity || 0;
    const extraBuffer = polDetailsData?.extraBuffer || 0;
    const qtyToMake = Math.round(orderQty + (orderQty * extraBuffer / 100));
    const partTargetQty = selectedPart.partType === 'MAIN' ? qtyToMake : (selectedPart.throwingOrder ? 1 : qtyToMake);
    
    // Get already recorded quantity for this stage
    const currentStageData = partStageRecords[stage];
    const alreadyRecordedQty = currentStageData?.totalQuantity || 0;
    const alreadyRecordedRejects = currentStageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0;
    
    // Calculate total after adding new entry (including both good and reject quantities)
    const totalAfterNewEntry = alreadyRecordedQty + qty + alreadyRecordedRejects + rejectQty;
    
    // Define stage flow and validation rules - same as Input Production
    const stageFlow = {
      THROWING: { prevStage: null, maxQty: partTargetQty },
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
    
    // For THROWING stage, validate against part target quantity
    if ('maxQty' in flowConfig) {
      const maxQty = flowConfig.maxQty;
      if (totalAfterNewEntry > maxQty) {
        return {
          valid: false,
          error: `Total quantity (${totalAfterNewEntry}) cannot exceed quantity to make (${maxQty}). Order: ${orderQty} + Extra: ${extraBuffer}% = ${qtyToMake}. Already recorded: ${alreadyRecordedQty} good + ${alreadyRecordedRejects} reject, New entry: ${qty} good + ${rejectQty} reject. Please reduce quantity.`
        };
      }
      return { valid: true };
    }
    
    // For other stages, validate against previous stage's output
    if (flowConfig.prevStage) {
      const prevStageData = partStageRecords[flowConfig.prevStage];
      
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

  const handlePartSubmit = async () => {
    try {
      if (!selectedPart || !partQuantity || parseInt(partQuantity) <= 0) {
        showSnackbar('Please select part and enter valid quantity', 'error');
        return;
      }

      if (!partProductionDate) {
        showSnackbar('Please select production date', 'error');
        return;
      }

      const qty = parseInt(partQuantity);
      const rejectQty = parseInt(partRejectQuantity) || 0;
      
      const validationResult = validatePartStageQuantity(partCurrentStage, qty, rejectQty);
      if (!validationResult.valid) {
        const errorMessage = validationResult.error || 'Validation failed';
        setPartValidationError(errorMessage);
        return;
      }

      const result = await productionService.trackPartProduction({
        polDetailId: Number(selectedProduct),
        partId: selectedPart.id,
        stage: partCurrentStage,
        quantity: qty,
        rejectQuantity: rejectQty,
        category: partCurrentCategory,
        remakeType: partSelectedRemakeType || undefined,
        ovenId: partSelectedOven ? Number(partSelectedOven) : undefined,
        operatorId: partSelectedOperator ? Number(partSelectedOperator) : undefined,
        rejectReasonId: partSelectedDefectReason ? Number(partSelectedDefectReason) : undefined,
        notes: partNotes,
        productionDate: partProductionDate || undefined,
      });

      console.log('Production record created:', result);
      const payload = result as any;
      if (payload?.discrepancyDetected) {
        setDiscrepancyAlert(payload);
        showSnackbar('Quantity discrepancy detected', 'warning');
      } else {
        setPartQuantity('');
        setPartRejectQuantity('');
        setPartNotes('');
        setPartProductionDate('');
        setPartSelectedOperator('');
        setPartSelectedOven('');
        setPartSelectedDefectReason('');
        setPartSelectedRemakeType('');
        setPartValidationError('');
        showSnackbar('Part production data saved successfully', 'success');
        handlePartSelect(selectedPart);
      }
    } catch (error: any) {
      console.error('Error tracking part production:', error);
      showSnackbar(error.message || 'Failed to track part production', 'error');
    }
  };

  // Load part combinations
  const loadPartCombinations = async () => {
    if (!selectedProduct) return;
    try {
      const combinations = await productionService.getPartCombinations(Number(selectedProduct));
      setPartCombinations(combinations || []);
    } catch (error) {
      console.error('Error loading part combinations:', error);
    }
  };

  // Combine Parts handlers
  const handleOpenCombineDialog = () => {
    setCombineDialogOpen(true);
    setCombineStage('');
    setCombineCategory('FORMING');
    setSelectedPartsForCombine({});
    setCombineNotes('');
  };

  const handleCloseCombineDialog = () => {
    setCombineDialogOpen(false);
  };

  const handlePartSelectionForCombine = (partId: number, quantity: number) => {
    setSelectedPartsForCombine(prev => {
      const newSelection = { ...prev };
      if (quantity <= 0) {
        delete newSelection[partId];
      } else {
        newSelection[partId] = quantity;
      }
      return newSelection;
    });
  };

  const handleCombineParts = async () => {
    try {
      const parts = Object.entries(selectedPartsForCombine)
        .filter(([_, qty]) => qty > 0)
        .map(([partId, quantity]) => ({
          partId: Number(partId),
          quantity,
        }));

      if (parts.length < 2) {
        showSnackbar('Please select at least 2 parts to combine', 'error');
        return;
      }

      if (!combineStage) {
        showSnackbar('Please select a stage for combination', 'error');
        return;
      }

      setCombineLoading(true);
      await productionService.combineParts({
        polDetailId: Number(selectedProduct),
        stage: combineStage,
        parts,
        notes: combineNotes,
      });

      showSnackbar('Parts combined successfully', 'success');
      handleCloseCombineDialog();
      loadPartCombinations();
      loadProductionStages();
    } catch (error: any) {
      console.error('Error combining parts:', error);
      showSnackbar(error.message || 'Failed to combine parts', 'error');
    } finally {
      setCombineLoading(false);
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
              <Tab label="Production" value="part-production" />
              <Tab label="Product Parts" value="parts" />
              <Tab label="Combine Parts" value="combine-parts" />
              <Tab label="Remake History" value="remakes" />
            </Tabs>
 
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
                             <TableCell>
                               <Box sx={{ display: 'flex', gap: 1 }}>
                                 <IconButton size="small" onClick={() => handleOpenEditPartDialog(part)}>
                                   <EditIcon fontSize="small" />
                                 </IconButton>
                                 <IconButton size="small" onClick={() => handleDeletePart(part.id)}>
                                   <DeleteIcon fontSize="small" />
                                 </IconButton>
                               </Box>
                             </TableCell>
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
 
          {/* Part Production Tab */}
          {tabValue === 'part-production' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Production Tracking</Typography>
                {productParts.length > 0 ? (
                  <>
                    {/* Part Selection */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" gutterBottom>Select Part to Track:</Typography>
                      <Grid container spacing={1}>
                        {productParts.map((part) => (
                          <Grid item key={part.id}>
                            <Chip
                              label={`${part.partName} (${part.partType})`}
                              onClick={() => handlePartSelect(part)}
                              color={selectedPart?.id === part.id ? 'primary' : 'default'}
                              variant={selectedPart?.id === part.id ? 'filled' : 'outlined'}
                              sx={{ cursor: 'pointer' }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* No Part Selected State */}
                    {!selectedPart ? (
                      <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2 }}>
                        <Typography variant="h6" color="textSecondary" gutterBottom>
                          Select a Part to Start Tracking
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Click on a part chip above to track production for that component.
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={3}>
                        {/* Left Side - Category Tabs */}
                        <Grid item xs={12} md={7} sx={{ width: { md: '50%' }, flexBasis: { md: '50%' }, maxWidth: { md: '50%' } }}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>Production Categories</Typography>
                              <Tabs
                                orientation="vertical"
                                value={categories.indexOf(partCurrentCategory)}
                                onChange={handlePartCategoryTabChange}
                                variant="scrollable"
                                scrollButtons="auto"
                                sx={{ 
                                  minWidth: 280,
                                  '& .MuiTabs-flexContainer': {
                                    alignItems: 'stretch',
                                  },
                                  '& .MuiTab-root': { 
                                    justifyContent: 'flex-start',
                                    textAlign: 'left',
                                    borderRadius: 1,
                                    mb: 0.5,
                                    minWidth: 260,
                                    maxWidth: 'none',
                                  }
                                }}
                              >
                                {categories.map((category, index) => (
                                  <Tab 
                                    key={category} 
                                    label={
                                      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 0.5 }}>
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
                                        </Box>
                                        <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0.5, mt: 0.5, width: '100%', overflow: 'visible' }}>
                                          {getStagesForCategory(category)?.filter((stage: string) => getCategoryForStage(stage) === category)?.map((stage: string) => {
                                            const stageData = partStageRecords[stage];
                                            const totalRejects = stageData?.totalRejectQuantity || stageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0;
                                            if (stageData?.totalQuantity > 0 || totalRejects > 0) {
                                              return (
                                                <Box key={stage} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                                                  <Typography variant="caption" sx={{ fontSize: '0.75rem', minWidth: 'auto', color: 'text.secondary', whiteSpace: 'nowrap' }}>
                                                    {stageNames[stage]?.split(' ')[0] || stage}:
                                                  </Typography>
                                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                    <Chip
                                                      label={stageData.totalQuantity}
                                                      size="small"
                                                      color="success"
                                                      sx={{ height: 26, fontSize: '0.85rem', fontWeight: 'bold', minWidth: 35 }}
                                                    />
                                                    {totalRejects > 0 && (
                                                      <Chip
                                                        label={`-${totalRejects}`}
                                                        size="small"
                                                        color="error"
                                                        sx={{ height: 26, fontSize: '0.85rem', fontWeight: 'bold', minWidth: 35 }}
                                                      />
                                                    )}
                                                  </Box>
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
                                  Stages in {categoryLabels[partCurrentCategory]}:
                                </Typography>
                                <Grid container spacing={1}>
                                  {getStagesForCategory(partCurrentCategory).map(stage => {
                                    const stageData = partStageRecords[stage];
                                    const isActive = partCurrentStage === stage;
                                    const hasData = stageData?.totalQuantity > 0;
                                     
                                    return (
                                      <Grid item xs={6} key={stage}>
                                        <Button
                                          fullWidth
                                          variant={isActive ? 'contained' : hasData ? 'outlined' : 'text'}
                                          color={isActive ? 'primary' : hasData ? 'success' : 'inherit'}
                                          onClick={() => handlePartStageSelect(stage)}
                                          size="small"
                                          sx={{ 
                                            justifyContent: 'flex-start',
                                            bgcolor: isActive ? categoryColors[partCurrentCategory] : undefined,
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
                        <Grid item xs={12} md={5} sx={{ width: { md: '50%' }, flexBasis: { md: '50%' }, maxWidth: { md: '50%' } }}>
                          <Card sx={{ height: '100%' }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Chip 
                                  label={categoryLabels[partCurrentCategory]} 
                                  sx={{ 
                                    bgcolor: categoryColors[partCurrentCategory], 
                                    color: 'white',
                                    fontWeight: 'bold',
                                    mr: 2
                                  }}
                                />
                                <Typography variant="h6">
                                  {stageNames[partCurrentStage] || partCurrentStage}
                                </Typography>
                              </Box>
                              
                              {/* Current Stage Info */}
                              {(() => {
                                const stageData = partStageRecords[partCurrentStage];
                                const hasRejects = (stageData?.totalRejectQuantity || stageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0) > 0;
                                if (!stageData || (stageData.totalQuantity === 0 && !hasRejects)) return null;
                                return (
                                  <Box sx={{ mb: 3, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                                    <Typography variant="subtitle2" color="success.main">
                                      Already recorded: {stageData.totalQuantity} good
                                      {hasRejects && (
                                        <Typography variant="subtitle2" color="error.main" sx={{ ml: 1 }}>
                                          + {stageData.totalRejectQuantity || stageData.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0)} reject
                                        </Typography>
                                      )}
                                    </Typography>
                                    {stageData.latestRecord && (
                                      <Typography variant="body2" color="text.secondary">
                                        Last entry: {format(new Date(stageData.latestRecord.createdAt), 'MMM dd, yyyy HH:mm')}
                                        {stageData.latestRecord.notes && ` - ${stageData.latestRecord.notes}`}
                                      </Typography>
                                    )}
                                  </Box>
                                );
                              })()}
                              
                              {/* Input Form */}
                              <Grid container spacing={2}>
                                {/* Row 1: Date and Operator */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Production Date *"
                                    type="date"
                                    value={partProductionDate}
                                    onChange={(e) => setPartProductionDate(e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                    required
                                    error={!partProductionDate}
                                    helperText={!partProductionDate ? 'Production date is required' : ''}
                                  />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Operator</InputLabel>
                                    <Select
                                      value={partSelectedOperator}
                                      onChange={(e) => setPartSelectedOperator(e.target.value)}
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
                                
                                {/* Row 2: Quantity */}
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Quantity Produced"
                                    type="number"
                                    value={partQuantity}
                                    onChange={(e) => setPartQuantity(e.target.value)}
                                    required
                                    size="medium"
                                  />
                                </Grid>
                                
                                {/* Row 3: Reject and Reason */}
                                <Grid item xs={12} sm={6}>
                                  <TextField
                                    fullWidth
                                    label="Reject Quantity"
                                    type="number"
                                    value={partRejectQuantity}
                                    onChange={(e) => setPartRejectQuantity(e.target.value)}
                                    size="medium"
                                  />
                                </Grid>
                                {(parseInt(partRejectQuantity) > 0 || partSelectedDefectReason) && (
                                  <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                      <InputLabel>Reject Reason</InputLabel>
                                      <Select
                                        value={partSelectedDefectReason}
                                        onChange={(e) => setPartSelectedDefectReason(e.target.value)}
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
                                
                                {/* Row 4: Product Type and Oven */}
                                <Grid item xs={12} sm={6}>
                                  <FormControl fullWidth>
                                    <InputLabel>Production Type</InputLabel>
                                    <Select
                                      value={partSelectedRemakeType}
                                      onChange={(e) => setPartSelectedRemakeType(e.target.value)}
                                      label="Production Type"
                                    >
                                      <MenuItem value="">Normal Production</MenuItem>
                                      <MenuItem value="RPR">RPR (Pre-Firing Remake)</MenuItem>
                                      <MenuItem value="RQC">RQC (Post-Firing Remake)</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Grid>
                                {firingStages.includes(partCurrentStage) && (
                                  <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth>
                                      <InputLabel>Oven</InputLabel>
                                      <Select
                                        value={partSelectedOven}
                                        onChange={(e) => setPartSelectedOven(e.target.value)}
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
                                
                                {/* Row 5: Notes */}
                                <Grid item xs={12}>
                                  <TextField
                                    fullWidth
                                    label="Notes"
                                    multiline
                                    rows={3}
                                    value={partNotes}
                                    onChange={(e) => setPartNotes(e.target.value)}
                                  />
                                </Grid>
                                
                                {/* Validation Error Alert */}
                                {partValidationError && (
                                  <Box sx={{ mb: 2, p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
                                    <Typography variant="body2" color="error">
                                      {partValidationError}
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
                                    onClick={handlePartSubmit}
                                    disabled={!partQuantity || parseInt(partQuantity) <= 0 || !partProductionDate}
                                    sx={{ 
                                      py: 1.5,
                                      bgcolor: categoryColors[partCurrentCategory],
                                      '&:hover': {
                                        bgcolor: categoryColors[partCurrentCategory],
                                        opacity: 0.9,
                                      }
                                    }}
                                  >
                                    Save Part Production Data
                                  </Button>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    )}
                  </>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      No product parts defined yet.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Add parts first in the "Product Parts" tab to track individual component production.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Combine Parts Tab */}
          {tabValue === 'combine-parts' && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">Combine Parts at Any Stage</Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCombineDialog}
                    disabled={productParts.length < 2}
                  >
                    Combine Parts
                  </Button>
                </Box>
                
                {productParts.length < 2 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      You need at least 2 parts to combine.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Add more parts in the "Product Parts" tab first.
                    </Typography>
                  </Box>
                ) : partCombinations.length > 0 ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Combined At Stage</strong></TableCell>
                          <TableCell><strong>Combined Quantity</strong></TableCell>
                          <TableCell><strong>Parts Included</strong></TableCell>
                          <TableCell><strong>Combined By</strong></TableCell>
                          <TableCell><strong>Date</strong></TableCell>
                          <TableCell><strong>Notes</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {partCombinations.map((combo) => (
                          <TableRow key={combo.id} hover>
                            <TableCell>
                              <Chip 
                                label={stageNames[combo.combinedAtStage] || combo.combinedAtStage} 
                                size="small" 
                                color="primary"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {combo.combinedQuantity}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {combo.combinationItems.map((item: any) => (
                                  <Chip
                                    key={item.id}
                                    label={`${item.part.partName} (${item.quantityUsed})`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </TableCell>
                            <TableCell>{combo.combinedByUser?.fullName || '-'}</TableCell>
                            <TableCell>
                              {combo.createdAt ? format(new Date(combo.createdAt), 'MMM dd, yyyy HH:mm') : '-'}
                            </TableCell>
                            <TableCell>{combo.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="textSecondary">
                      No part combinations recorded yet.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Click "Combine Parts" to manually combine parts at any production stage.
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
       
        {/* Edit Part Dialog */}
        <Dialog open={editPartDialogOpen} onClose={handleCloseEditPartDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingPart ? 'Edit Product Part' : 'Add New Product Part'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Part Name"
                  value={editPartName}
                  onChange={(e) => setEditPartName(e.target.value)}
                  placeholder="e.g., Body, Lid, Spout, Handle"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Part Type</InputLabel>
                  <Select
                    value={editPartType}
                    onChange={(e) => setEditPartType(e.target.value)}
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
                    value={editPartThrowingRequired ? 'Yes' : 'No'}
                    onChange={(e) => setEditPartThrowingRequired(e.target.value === 'Yes')}
                    label="Throwing Required"
                  >
                    <MenuItem value="Yes">Yes</MenuItem>
                    <MenuItem value="No">No</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Linked To Part</InputLabel>
                  <Select
                    value={editPartLinkedToPartId ?? ''}
                    onChange={(e) => setEditPartLinkedToPartId(e.target.value ? Number(e.target.value) : null)}
                    label="Linked To Part"
                  >
                    <MenuItem value="">None</MenuItem>
                    {productParts
                      .filter(p => p.id !== editingPart?.id) // Exclude current part from linking to itself
                      .map((part) => (
                        <MenuItem key={part.id} value={part.id}>
                          {part.partName} ({part.partType})
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Throwing Order"
                  type="number"
                  value={editPartThrowingOrder}
                  onChange={(e) => setEditPartThrowingOrder(e.target.value ? Number(e.target.value) : '')}
                  placeholder="Optional: 1, 2, 3..."
                  helperText="Order for multi-part throwing sequence"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditPartDialog}>Cancel</Button>
            <Button onClick={handleUpdatePart} variant="contained" disabled={!editPartName}>
              {editingPart ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Combine Parts Dialog */}
        <Dialog open={combineDialogOpen} onClose={handleCloseCombineDialog} maxWidth="md" fullWidth>
          <DialogTitle>Combine Parts at Any Stage</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Select parts to combine and specify the stage where combination occurs. The combined quantity will be the minimum of all selected parts.
            </Typography>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Stage Selection */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Combine At Stage</InputLabel>
                  <Select
                    value={combineStage}
                    onChange={(e) => {
                      setCombineStage(e.target.value);
                      setCombineCategory(getCategoryForStage(e.target.value));
                    }}
                    label="Combine At Stage"
                  >
                    <MenuItem value="">Select Stage...</MenuItem>
                    {categories.map((category) => [
                      <MenuItem key={category} disabled sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                        {categoryLabels[category]}
                      </MenuItem>,
                      ...getStagesForCategory(category).map((stage) => (
                        <MenuItem key={stage} value={stage} sx={{ pl: 4 }}>
                          {stageNames[stage] || stage}
                        </MenuItem>
                      ))
                    ])}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Category Display */}
              {combineStage && (
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <Chip
                      label={categoryLabels[combineCategory]}
                      sx={{
                        bgcolor: categoryColors[combineCategory],
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Grid>
              )}
              
              {/* Parts Selection */}
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                  Select Parts to Combine:
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                        <TableCell padding="checkbox"><strong>Select</strong></TableCell>
                        <TableCell><strong>Part Name</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell><strong>Available Qty</strong></TableCell>
                        <TableCell><strong>Quantity to Combine</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {productParts.map((part) => {
                        const isSelected = selectedPartsForCombine[part.id] !== undefined;
                        const quantity = selectedPartsForCombine[part.id] || 0;
                        
                        return (
                          <TableRow key={part.id} hover>
                            <TableCell padding="checkbox">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handlePartSelectionForCombine(part.id, 1);
                                  } else {
                                    handlePartSelectionForCombine(part.id, 0);
                                  }
                                }}
                              />
                            </TableCell>
                            <TableCell>{part.partName}</TableCell>
                            <TableCell>
                              <Chip label={part.partType} size="small" />
                            </TableCell>
                            <TableCell>-</TableCell>
                            <TableCell>
                              {isSelected && (
                                <TextField
                                  type="number"
                                  size="small"
                                  value={quantity}
                                  onChange={(e) => handlePartSelectionForCombine(part.id, Number(e.target.value))}
                                  sx={{ width: 100 }}
                                  inputProps={{ min: 1 }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>
              
              {/* Notes */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={combineNotes}
                  onChange={(e) => setCombineNotes(e.target.value)}
                  placeholder="Optional notes about this combination..."
                />
              </Grid>
              
              {/* Summary */}
              {Object.keys(selectedPartsForCombine).filter(id => selectedPartsForCombine[Number(id)] > 0).length >= 2 && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="primary">
                      Combination Summary:
                    </Typography>
                    <Typography variant="body2">
                      {Object.entries(selectedPartsForCombine)
                        .filter(([_, qty]) => qty > 0)
                        .map(([partId, qty]) => {
                          const part = productParts.find(p => p.id === Number(partId));
                          return `${part?.partName}: ${qty}`;
                        })
                        .join(' + ')}
                      {' = '}
                      <strong>
                        {Math.min(...Object.values(selectedPartsForCombine).filter(qty => qty > 0))} combined units
                      </strong>
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCombineDialog}>Cancel</Button>
            <Button
              onClick={handleCombineParts}
              variant="contained"
              disabled={
                combineLoading ||
                !combineStage ||
                Object.keys(selectedPartsForCombine).filter(id => selectedPartsForCombine[Number(id)] > 0).length < 2
              }
            >
              {combineLoading ? 'Combining...' : 'Combine Parts'}
            </Button>
          </DialogActions>
        </Dialog>
     </Box>
   );
 };

 export default ProductionTracking;
