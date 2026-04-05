import React, { useState, useEffect, useMemo } from 'react';
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
  LinearProgress,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Switch,
  FormControlLabel,
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
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { fetchProductionStages, trackProduction } from '../store/slices/productionSlice';
import { fetchPOLs } from '../store/slices/polSlice';
import { fetchActiveProduction } from '../store/slices/productionSlice';
import { productionService } from '../services/production.service';
import { polService } from '../services/pol.service';
import { stageService, StageCategory, ProductionStage } from '../services/stage.service';
import { format } from 'date-fns';

// Default fallback data (used when API fails)
const defaultStageNames: Record<string, string> = {
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
  QC_RE_FIRING: 'Re-Firing',
  QC_SECOND: 'Second',
};

const defaultCategoryColors: Record<string, string> = {
  FORMING: '#4caf50',
  DECOR: '#ff9800',
  DRYING: '#9c27b0',
  FIRING: '#f44336',
  GLAZING: '#2196f3',
  QC: '#607d8b',
};

const defaultCategoryLabels: Record<string, string> = {
  FORMING: 'Forming',
  DECOR: 'Decoration',
  DRYING: 'Drying',
  FIRING: 'Firing',
  GLAZING: 'Glazing',
  QC: 'QC',
};

const defaultCategoryStages: Record<string, string[]> = {
  FORMING: ['THROWING', 'TRIMMING'],
  DECOR: ['DECORATION'],
  DRYING: ['DRYING'],
  FIRING: ['LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING'],
  GLAZING: ['SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION'],
  QC: ['QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'],
};

const defaultFiringStages = ['LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING'];

const ProductionTracking = () => {
  const dispatch = useAppDispatch();
  const { pols } = useAppSelector((state) => state.pol);
  
  // Dynamic stages state
  const [stageCategories, setStageCategories] = useState<StageCategory[]>([]);
  const [allStages, setAllStages] = useState<ProductionStage[]>([]);
  const [stagesLoading, setStagesLoading] = useState(true);
  
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
  const [tabValue, setTabValue] = useState('input-production');
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
  
   // Remake Escalation Dialog state (for R4+ validation)
  const [remakeEscalationDialogOpen, setRemakeEscalationDialogOpen] = useState(false);
  const [remakeEscalationNotes, setRemakeEscalationNotes] = useState('');
  const [pendingRemakeSubmit, setPendingRemakeSubmit] = useState<{
    type: 'main' | 'part';
    data?: any;
  } | null>(null);
  
  // Detail Processes state
  const [detailProcesses, setDetailProcesses] = useState<any[]>([]);
  const [selectedDetailProcess, setSelectedDetailProcess] = useState('');
  const [partDetailProcesses, setPartDetailProcesses] = useState<any[]>([]);
  const [partSelectedDetailProcess, setPartSelectedDetailProcess] = useState('');
  
  // Active Remake Cycle Selection state
  const [selectedActiveRemakeCycle, setSelectedActiveRemakeCycle] = useState<any>(null);
  const [activeRemakeCycles, setActiveRemakeCycles] = useState<any[]>([]);
  
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
  
  // Load stages from API
  useEffect(() => {
    const loadStages = async () => {
      try {
        setStagesLoading(true);
        const categories = await stageService.getCategories();
        setStageCategories(categories);
        
        // Flatten all stages from categories
        const stages = categories.flatMap(cat => cat.stages || []);
        setAllStages(stages);
      } catch (error) {
        console.error('Error loading stages:', error);
        // Use default data on error
        setStageCategories([]);
        setAllStages([]);
      } finally {
        setStagesLoading(false);
      }
    };
    
    loadStages();
  }, []);
  
  // Dynamic mappings from API data
  const stageNames = useMemo(() => {
    if (allStages.length > 0) {
      return allStages.reduce((acc, stage) => {
        acc[stage.code] = stage.name;
        return acc;
      }, {} as Record<string, string>);
    }
    return defaultStageNames;
  }, [allStages]);
  
  const categoryColors = useMemo(() => {
    if (stageCategories.length > 0) {
      return stageCategories.reduce((acc, cat) => {
        acc[cat.code] = cat.color;
        return acc;
      }, {} as Record<string, string>);
    }
    return defaultCategoryColors;
  }, [stageCategories]);
  
  const categoryLabels = useMemo(() => {
    if (stageCategories.length > 0) {
      return stageCategories.reduce((acc, cat) => {
        acc[cat.code] = cat.name;
        return acc;
      }, {} as Record<string, string>);
    }
    return defaultCategoryLabels;
  }, [stageCategories]);
  
  // Determine if this product skips forming stages (HAND_BUILT, SLAB_TRAY)
  const isNonThrowingProduct = useMemo(() => {
    const productType = polDetailsData?.productType || '';
    const workflowType = productionWorkflow?.workflowType || '';
    return productType === 'HAND_BUILT' || productType === 'SLAB_TRAY' ||
           workflowType === 'HANDBUILD' || workflowType === 'SLAB';
  }, [polDetailsData?.productType, productionWorkflow?.workflowType]);
  
  // Filter categories based on product type - exclude FORMING for non-throwing products
  const categories = useMemo(() => {
    let allCategories: string[];
    if (stageCategories.length > 0) {
      allCategories = stageCategories.map(cat => cat.code);
    } else {
      allCategories = ['FORMING', 'DECOR', 'DRYING', 'FIRING', 'GLAZING', 'QC'];
    }
    
    // Filter out FORMING for HAND_BUILT/SLAB_TRAY products
    if (isNonThrowingProduct) {
      return allCategories.filter(cat => cat !== 'FORMING');
    }
    return allCategories;
  }, [stageCategories, isNonThrowingProduct]);
  
  const categoryStages = useMemo(() => {
    if (stageCategories.length > 0) {
      return stageCategories.reduce((acc, cat) => {
        acc[cat.code] = (cat.stages || []).map(s => s.code);
        return acc;
      }, {} as Record<string, string[]>);
    }
    return defaultCategoryStages;
  }, [stageCategories]);
  
  const firingStages = useMemo(() => {
    if (allStages.length > 0) {
      return allStages.filter(s => s.requiresOven).map(s => s.code);
    }
    return defaultFiringStages;
  }, [allStages]);
  
  // Get category for a stage
  const getCategoryForStage = (stageCode: string): string => {
    if (stageCategories.length > 0) {
      for (const cat of stageCategories) {
        if (cat.stages?.some(s => s.code === stageCode)) {
          return cat.code;
        }
      }
    }
    // Fallback to default mapping
    const formingStages = ['THROWING', 'TRIMMING'];
    const decorStages = ['DECORATION'];
    const dryingStages = ['DRYING'];
    const firingStagesList = ['LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING'];
    const glazingStages = ['SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION'];
    const qcStages = ['QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];

    if (formingStages.includes(stageCode)) return 'FORMING';
    if (decorStages.includes(stageCode)) return 'DECOR';
    if (dryingStages.includes(stageCode)) return 'DRYING';
    if (firingStagesList.includes(stageCode)) return 'FIRING';
    if (glazingStages.includes(stageCode)) return 'GLAZING';
    if (qcStages.includes(stageCode)) return 'QC';

    return 'FORMING';
  };
  
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
      const result = await dispatch(fetchProductionStages(selectedProduct));
      const payload = result.payload as any;
      if (payload) {
        const stages = payload.stages as any[];
        
        // Get the workflow stages from the payload (if available)
        const workflowStages = payload.workflow?.stages || [];
        
        // IMPORTANT: Store the workflow for validation
        if (payload.workflow) {
          console.log(`[loadProductionStages] Workflow: ${payload.workflow.workflowType}, Stages:`, workflowStages);
          setProductionWorkflow(payload.workflow);
        }
        
        // Find current stage from records
        let currentStageFound = '';
        
        // Check if there are any existing records
        stages.forEach((stageData: any) => {
          if (stageData.records && stageData.records.length > 0) {
            currentStageFound = stageData.stage;
          }
        });
        
        // If no records found, use the first stage from the workflow
        if (!currentStageFound && workflowStages.length > 0) {
          currentStageFound = workflowStages[0];
          console.log(`[loadProductionStages] No existing records, using first workflow stage: ${currentStageFound}`);
        } else if (!currentStageFound) {
          // Fallback to THROWING if no workflow available
          currentStageFound = 'THROWING';
          console.log(`[loadProductionStages] No workflow available, defaulting to THROWING`);
        }
        
        setCurrentStage(currentStageFound);
        setCurrentCategory(getCategoryForStage(currentStageFound));
        
        // Set the category tab based on current stage
        // Note: categories is now filtered based on product type
        const stageCategory = getCategoryForStage(currentStageFound);
        const filteredCategories = isNonThrowingProduct
          ? categories.filter(cat => cat !== 'FORMING')
          : categories;
        const categoryIndex = filteredCategories.indexOf(stageCategory);
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
    } catch (error: any) {
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
      const response = await productionService.getOperators();
      // Handle both wrapped response { success, data } and direct data
      const operatorsData = (response as any)?.data || response;
      console.log('[loadOperators] Response:', response);
      console.log('[loadOperators] Operators data:', operatorsData);
      setOperators(Array.isArray(operatorsData) ? operatorsData : []);
    } catch (error) {
      console.error('Error loading operators:', error);
      setOperators([]);
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
      const partsData = await productionService.getProductParts(selectedProduct);
      
      // Auto-create default MAIN part if no parts exist
      if (!partsData || partsData.length === 0) {
        try {
          const defaultPart = await productionService.createProductPart({
            polDetailId: selectedProduct,
            partName: 'Main',
            partType: 'MAIN',
            throwingRequired: true,
            throwingOrder: 1,
          });
          
          // Reload parts after creating default
          const refreshedParts = await productionService.getProductParts(selectedProduct);
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
      console.log(`[loadRemakeCycles] Loading cycles for product ${selectedProduct}`);
      // Get remake cycles from production records (which have remakeType field)
      const stagesData = await productionService.getProductionStages(selectedProduct);
      
      // Extract remake cycles from production records
      const remakeRecords: any[] = [];
      
      if (stagesData?.stages) {
        stagesData.stages.forEach((stageData: any) => {
          if (stageData.records) {
            stageData.records.forEach((record: any) => {
              if (record.remakeType && (record.remakeType === 'RPR' || record.remakeType === 'RQC')) {
                remakeRecords.push({
                  id: record.id,
                  remakeNumber: record.remakeCycle || 1,
                  remakeType: record.remakeType,
                  rejectStage: record.stage,
                  rejectQuantity: record.quantity + (record.rejectQuantity || 0),
                  status: record.remakeCycle >= 4 ? 'ESCALATED' : 'COMPLETED',
                  createdAt: record.createdAt,
                });
              }
            });
          }
        });
      }
      
      console.log(`[loadRemakeCycles] Loaded cycles from records:`, remakeRecords);
      setRemakeCycles(remakeRecords || []);
    } catch (error) {
      console.error('Error loading remake cycles:', error);
      setRemakeCycles([]);
    }
  };

  // Get the next remake number for a specific remake type (RPR or RQC)
  const getNextRemakeNumberByType = (remakeType: string): number => {
    if (remakeType !== 'RPR' && remakeType !== 'RQC') return 1;
    
    // Filter cycles by type and get max
    const typeCycles = remakeCycles.filter(c => c.remakeType === remakeType);
    if (typeCycles.length === 0) return 1;
    
    // Get max remake number for this type and add 1
    const maxRemakeNumber = Math.max(...typeCycles.map(c => c.remakeNumber || 1));
    return maxRemakeNumber + 1;
  };

  // Get total remade quantity for a specific remake type
  const getTotalRemadeQtyByType = (remakeType: string): number => {
    if (remakeType !== 'RPR' && remakeType !== 'RQC') return 0;
    
    const typeCycles = remakeCycles.filter(c => c.remakeType === remakeType);
    return typeCycles.reduce((sum, c) => sum + (c.rejectQuantity || 0), 0);
  };

  // Check if this will be a R4+ remake (requires escalation)
  const isR4PlusRemake = (remakeType: string): boolean => {
    if (remakeType !== 'RPR' && remakeType !== 'RQC') return false;
    const nextRemakeNumber = getNextRemakeNumberByType(remakeType);
    console.log(`[R4+ Check] remakeType=${remakeType}, nextRemakeNumber=${nextRemakeNumber}, isR4Plus=${nextRemakeNumber >= 4}`);
    console.log(`[R4+ Check] Current remakeCycles state:`, remakeCycles);
    return nextRemakeNumber >= 4;
  };

  // Check if normal production exists for this part (required before remake can be done)
  const hasNormalProduction = (): boolean => {
    // Check if any production records exist without remakeType (normal production)
    const stageData = partStageRecords['THROWING'];
    if (stageData && stageData.records && stageData.records.length > 0) {
      // Check if there's at least one record without remakeType
      const normalRecords = stageData.records.filter((r: any) => !r.remakeType || r.remakeType === '');
      return normalRecords.length > 0;
    }
    // Also check other stages for normal production
    return Object.values(partStageRecords).some((stageData: any) => {
      if (stageData && stageData.records && stageData.records.length > 0) {
        const normalRecords = stageData.records.filter((r: any) => !r.remakeType || r.remakeType === '');
        return normalRecords.length > 0;
      }
      return false;
    });
  };

  // Get active (incomplete) remake cycles from production records
  // Groups records by remakeType and remakeCycle to identify active cycles
  const getActiveRemakeCycles = (): any[] => {
    const cyclesMap: Record<string, any> = {};
    
    Object.values(partStageRecords).forEach((stageData: any) => {
      if (stageData && stageData.records) {
        stageData.records.forEach((record: any) => {
          if (record.remakeType && (record.remakeType === 'RPR' || record.remakeType === 'RQC')) {
            const cycleKey = `${record.remakeType}-${record.remakeCycle}`;
            if (!cyclesMap[cycleKey]) {
              cyclesMap[cycleKey] = {
                key: cycleKey,
                remakeType: record.remakeType,
                remakeNumber: record.remakeCycle,
                currentStage: record.stage,
                totalQuantity: 0,
                latestRecord: null,
                latestDate: null,
                stagesCompleted: [],
              };
            }
            cyclesMap[cycleKey].totalQuantity += record.quantity + (record.rejectQuantity || 0);
            cyclesMap[cycleKey].stagesCompleted.push(record.stage);
            if (!cyclesMap[cycleKey].latestDate || new Date(record.createdAt) > new Date(cyclesMap[cycleKey].latestDate)) {
              cyclesMap[cycleKey].latestDate = record.createdAt;
              cyclesMap[cycleKey].latestRecord = record;
              cyclesMap[cycleKey].currentStage = record.stage;
            }
          }
        });
      }
    });
    
    return Object.values(cyclesMap).sort((a: any, b: any) => {
      // Sort by remakeType first, then by remakeNumber
      if (a.remakeType !== b.remakeType) {
        return a.remakeType.localeCompare(b.remakeType);
      }
      return a.remakeNumber - b.remakeNumber;
    });
  };

  // Get next available stage for a remake cycle
  const getNextStageForCycle = (cycle: any): string => {
    const rprStagesOrder = [
      'THROWING', 'TRIMMING', 'DECORATION', 'DRYING',
      'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING'
    ];
    const rqcStagesOrder = [
      'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING',
      'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION'
    ];
    const stagesOrder = cycle.remakeType === 'RPR' ? rprStagesOrder : rqcStagesOrder;
    const completedStages = new Set(cycle.stagesCompleted || []);
    
    for (const stage of stagesOrder) {
      if (!completedStages.has(stage)) {
        return stage;
      }
    }
    return cycle.currentStage; // All stages complete
  };

  // Handle selecting an active remake cycle to continue
  const handleSelectActiveRemakeCycle = (cycle: any) => {
    setSelectedActiveRemakeCycle(cycle);
    // Auto-set the remake type and number
    setPartSelectedRemakeType(cycle.remakeType);
    // The next stage would be determined by the cycle's current position
  };

  // Handle creating a new remake cycle
  const handleCreateNewRemakeCycle = (remakeType: string) => {
    setSelectedActiveRemakeCycle(null);
    setPartSelectedRemakeType(remakeType);
  };
  
  // Validate that remake follows proper stage sequence
  // RPR (Pre-Firing Remake): Should follow stages in order from throwing through firing
  // RQC (Post-Firing Remake): Should follow stages in order from sanding/glazing through QC
  const validateRemakeStageSequence = (
    stage: string, 
    remakeType: string, 
    stageRecords: Record<string, any>
  ): { valid: boolean; error?: string } => {
    if (!remakeType || (remakeType !== 'RPR' && remakeType !== 'RQC')) {
      return { valid: true }; // Not a remake, skip this validation
    }
    
    // Define stage order for each remake type
    const rprStagesOrder = [
      'THROWING', 'TRIMMING', 'DECORATION', 'DRYING',
      'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING'
    ];
    
    const rqcStagesOrder = [
      'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING',
      'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION',
      'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'
    ];
    
    const stagesOrder = remakeType === 'RPR' ? rprStagesOrder : rqcStagesOrder;
    
    // Find the index of the current stage being submitted
    const currentStageIndex = stagesOrder.indexOf(stage);
    if (currentStageIndex === -1) {
      // Stage not in the expected order for this remake type
      return { 
        valid: false, 
        error: `${stageNames[stage] || stage} is not a valid stage for ${remakeType} remake. ${remakeType === 'RPR' ? 'RPR' : 'RQC'} remakes should follow stages from ${stageNames[stagesOrder[0]] || stagesOrder[0]} through ${stageNames[stagesOrder[stagesOrder.length - 1]] || stagesOrder[stagesOrder.length - 1]}.` 
      };
    }
    
    // Check if all previous stages in the sequence have been completed for this remake cycle
    // For the first remake (R1), check if previous stages in the overall flow have data
    const nextRemakeNumber = getNextRemakeNumberByType(remakeType);
    
    for (let i = 0; i < currentStageIndex; i++) {
      const prevStage = stagesOrder[i];
      const stageData = stageRecords[prevStage];
      const hasData = stageData && (stageData.totalQuantity > 0 || (stageData.records && stageData.records.length > 0));
      
      if (!hasData) {
        // For R1, we allow starting from any stage (user may have done some stages already)
        // For R2+, we should check if previous stages were completed in the same remake cycle
        if (nextRemakeNumber > 1) {
          return { 
            valid: false, 
            error: `${remakeType} R${nextRemakeNumber} must follow the stage sequence. Please complete ${stageNames[prevStage] || prevStage} before ${stageNames[stage] || stage}.` 
          };
        }
      }
    }
    
    return { valid: true };
  };

  // Get the display label for current remake cycle
  const getRemakeCycleLabel = (remakeType: string): string => {
    if (remakeType !== 'RPR' && remakeType !== 'RQC') return '';
    const cycleNum = getNextRemakeNumberByType(remakeType);
    return `${remakeType} R${cycleNum}`;
  };

  // Get next remake number (default: check RPR cycles)
  const getNextRemakeNumber = (): number => {
    // Default to checking RPR cycles
    return getNextRemakeNumberByType('RPR');
  };

  // Handle opening the remake escalation dialog
  const handleOpenRemakeEscalation = (submitType: 'main' | 'part', submitData?: any) => {
    console.log(`[handleOpenRemakeEscalation] Opening dialog, type=${submitType}, data=`, submitData);
    setPendingRemakeSubmit({ type: submitType, data: submitData });
    setRemakeEscalationDialogOpen(true);
    setRemakeEscalationNotes('');
  };

  // Handle closing the remake escalation dialog (Cancel button only)
  const handleCloseRemakeEscalation = () => {
    // Only close if notes are empty (user cancelled without entering notes)
    // Don't clear pendingRemakeSubmit so user can retry with notes
    setRemakeEscalationDialogOpen(false);
    setRemakeEscalationNotes('');
  };
  
  // Force close escalation dialog after successful submission
  const forceCloseRemakeEscalation = () => {
    setRemakeEscalationDialogOpen(false);
    setRemakeEscalationNotes('');
    setPendingRemakeSubmit(null);
  };

  // Handle confirming the remake escalation and proceed with submission
  const handleConfirmRemakeEscalation = async () => {
    if (!remakeEscalationNotes.trim()) {
      showSnackbar('Investigation notes are required before proceeding with R4+ remake', 'error');
      return;
    }
    
    if (pendingRemakeSubmit) {
      if (pendingRemakeSubmit.type === 'main') {
        // Add escalation notes to the submission
        const submitData = pendingRemakeSubmit.data;
        // Re-trigger the main submit with escalation notes
        await executeMainProductionSubmit({ ...submitData, escalationNotes: remakeEscalationNotes });
      } else if (pendingRemakeSubmit.type === 'part') {
        // Add escalation notes to the part submission
        await executePartProductionSubmit({ ...pendingRemakeSubmit.data, escalationNotes: remakeEscalationNotes });
      }
    }
    
    forceCloseRemakeEscalation();
  };

  // Execute the main production submission
  const executeMainProductionSubmit = async (submitData: any) => {
    try {
      const result = await dispatch(trackProduction({
        polDetailId: String(selectedProduct),
        stage: currentStage,
        quantity: submitData.quantity,
        rejectQuantity: submitData.rejectQty,
        category: currentCategory,
        remakeType: selectedRemakeType || undefined,
        remakeCycle: submitData.remakeNumber,
        ovenId: selectedOven ? Number(selectedOven) : undefined,
        operatorId: selectedOperator ? Number(selectedOperator) : undefined,
        rejectReasonId: selectedDefectReason ? Number(selectedDefectReason) : undefined,
        notes: notes,
        productionDate: productionDate || undefined,
        escalationNotes: submitData.escalationNotes,
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

  // Execute the part production submission
  const executePartProductionSubmit = async (submitData: any) => {
    try {
      const result = await productionService.trackPartProduction({
        polDetailId: String(selectedProduct),
        partId: selectedPart.id,
        stage: partCurrentStage,
        quantity: submitData.quantity,
        rejectQuantity: submitData.rejectQty,
        category: partCurrentCategory,
        remakeType: partSelectedRemakeType || undefined,
        remakeCycle: submitData.remakeNumber,
        ovenId: partSelectedOven ? Number(partSelectedOven) : undefined,
        operatorId: partSelectedOperator ? Number(partSelectedOperator) : undefined,
        rejectReasonId: partSelectedDefectReason ? Number(partSelectedDefectReason) : undefined,
        notes: partNotes,
        productionDate: partProductionDate || undefined,
        escalationNotes: submitData.escalationNotes,
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
        // First reload remake cycles, then reload part stages
        await loadRemakeCycles();
        await handlePartSelect(selectedPart);
      }
    } catch (error: any) {
      console.error('Error tracking part production:', error);
      showSnackbar(error.message || 'Failed to track part production', 'error');
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

  // Get stages for a category (use dynamic data or fallback)
  const getStagesForCategory = (category: string): string[] => {
    if (productionWorkflow?.stages && productionWorkflow.stages.length > 0) {
      return productionWorkflow.stages.filter((stage: string) => getCategoryForStage(stage) === category);
    }
    return categoryStages[category] || [];
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
        const polData = await polService.getPOLById(polId);
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

   // Handle main stage selection with detail process loading
   const handleStageSelect = (stage: string) => {
     setCurrentStage(stage);
     
     // Load detail processes for selected stage
     const selectedStageData = allStages.find(s => s.code === stage);
     if (selectedStageData?.hasDetailProcess) {
       stageService.getProcessesByStageId(selectedStageData.id)
         .then(processes => {
           setDetailProcesses(processes);
         })
         .catch(error => {
           console.error('Error loading detail processes:', error);
           setDetailProcesses([]);
         });
     } else {
       setDetailProcesses([]);
     }
     setSelectedDetailProcess('');
   };

  // Validate stage quantity based on production flow
  // remakeType: 'RPR' (Pre-Firing Remake) or 'RQC' (Post-Firing Remake) - bypasses normal validation
  const validateStageQuantity = (stage: string, qty: number, rejectQty: number, remakeType?: string): { valid: boolean; error?: string } => {
    // Bypass validation for remake types - remakes are allowed beyond normal limits
    if (remakeType === 'RPR' || remakeType === 'RQC') {
      return { valid: true };
    }
    
    // Get workflow stages to determine the actual stage sequence for this product
    let workflowStages = productionWorkflow?.stages || [];
    let workflowType = productionWorkflow?.workflowType || '';
    
    // FALLBACK: If workflow not loaded yet, determine stages from product type
    // This handles cases where the user tries to save before the workflow is fully loaded
    if (workflowStages.length === 0) {
      const productType = polDetailsData?.productType || '';
      if (productType === 'HAND_BUILT' || productType === 'SLAB_TRAY') {
        // These products skip THROWING and TRIMMING
        workflowType = productType === 'HAND_BUILT' ? 'HANDBUILD' : 'SLAB';
        workflowStages = ['DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];
      }
    }
    
    // CRITICAL: Check if the stage is valid for this product's workflow
    // This check runs even if workflowStages is empty - it will block THROWING/TRIMMING for known non-throwing products
    const isNonThrowingProduct = workflowType === 'HANDBUILD' || workflowType === 'SLAB' ||
                                  polDetailsData?.productType === 'HAND_BUILT' || polDetailsData?.productType === 'SLAB_TRAY';
    
    if (isNonThrowingProduct && (stage === 'THROWING' || stage === 'TRIMMING')) {
      return {
        valid: false,
        error: `Stage "${stageNames[stage] || stage}" is not applicable for this product. This product uses ${workflowType || polDetailsData?.productType || 'HAND_BUILT/SLAB'} workflow which skips THROWING and TRIMMING stages.`
      };
    }
    
    if (workflowStages.length > 0 && !workflowStages.includes(stage)) {
      const skipMsg = isNonThrowingProduct ? 'skips THROWING and TRIMMING stages' : 'has a different workflow';
      return {
        valid: false,
        error: `Stage "${stageNames[stage] || stage}" is not part of this product's workflow (${workflowType || 'unknown'}). This product ${skipMsg}.`
      };
    }
    
    const orderQty = polDetailsData?.quantity || 0;
    const extraBuffer = polDetailsData?.extraBuffer ?? 15;
    const qtyToMake = Math.round(orderQty + (orderQty * extraBuffer / 100));
    
    // Get already recorded quantity for this stage
    const currentStageData = stageRecords[stage];
    const alreadyRecordedQty = currentStageData?.totalQuantity || 0;
    const alreadyRecordedRejects = currentStageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0;
    
    // Calculate total after adding new entry (including both good and reject quantities)
    const totalAfterNewEntry = alreadyRecordedQty + qty + alreadyRecordedRejects + rejectQty;
    
    // Find the index of the current stage in the workflow
    const currentStageIndex = workflowStages.indexOf(stage);
    
    // Determine the previous stage based on the workflow (not hardcoded)
    const prevStage = currentStageIndex > 0 ? workflowStages[currentStageIndex - 1] : null;
    
    console.log(`[validateStageQuantity] Stage: ${stage}, Index: ${currentStageIndex}, PrevStage: ${prevStage}, WorkflowStages:`, workflowStages);
    
    // For the first stage in the workflow, validate against qtyToMake
    if (currentStageIndex === 0) {
      if (totalAfterNewEntry > qtyToMake) {
        return {
          valid: false,
          error: `Total quantity (${totalAfterNewEntry}) cannot exceed quantity to make (${qtyToMake}). Already recorded: ${alreadyRecordedQty} good + ${alreadyRecordedRejects} reject, New entry: ${qty} good + ${rejectQty} reject. Order: ${orderQty} + Extra: ${extraBuffer}% = ${qtyToMake}. Please reduce quantity.`
        };
      }
      return { valid: true };
    }
    
    // For other stages, validate against previous stage's output
    if (prevStage) {
      const prevStageData = stageRecords[prevStage];
      
      if (!prevStageData || prevStageData.totalQuantity === 0) {
        return {
          valid: false,
          error: `Previous stage (${stageNames[prevStage] || prevStage}) has no recorded quantity. Please complete ${stageNames[prevStage] || prevStage} first.`
        };
      }
      
      // Calculate previous stage's available quantity
      const prevStageAvailableQty = prevStageData.totalQuantity;
      
      // Validate - current stage total should not exceed previous stage's available quantity
      if (totalAfterNewEntry > prevStageAvailableQty) {
        return {
          valid: false,
          error: `Total quantity (${totalAfterNewEntry}) cannot exceed available quantity from ${stageNames[prevStage] || prevStage} (${prevStageAvailableQty} good - rejects are discarded). Already recorded in ${stageNames[stage] || stage}: ${alreadyRecordedQty} good + ${alreadyRecordedRejects} reject, New entry: ${qty} good + ${rejectQty} reject. Please reduce quantity.`
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

      // Validate operator is required
      if (!selectedOperator) {
        showSnackbar('Please select operator', 'error');
        return;
      }

      // Validate reject reason is required when reject quantity > 0
      const parsedRejectQty = parseInt(rejectQuantity) || 0;
      if (parsedRejectQty > 0 && !selectedDefectReason) {
        showSnackbar('Please select reject reason when reject quantity is greater than 0', 'error');
        return;
      }

      const qty = parseInt(quantity);
      const rejectQty = parsedRejectQty;
      
      // Get dynamic validation based on stage flow (pass remakeType to allow bypass for remakes)
      const validationResult = validateStageQuantity(currentStage, qty, rejectQty, selectedRemakeType);
      if (!validationResult.valid) {
        const errorMessage = validationResult.error || 'Validation failed';
        setValidationError(errorMessage);
        return;
      }
      
      // Validate remake stage sequence (for R2+ remakes)
      if (selectedRemakeType) {
        // First validate that normal production exists before allowing remake
        const hasNormalProd = Object.values(stageRecords).some((stageData: any) => {
          if (stageData && stageData.records && stageData.records.length > 0) {
            const normalRecords = stageData.records.filter((r: any) => !r.remakeType || r.remakeType === '');
            return normalRecords.length > 0;
          }
          return false;
        });
        if (!hasNormalProd) {
          setValidationError('Cannot create remake - no normal production records found. Please complete normal production first before creating remakes.');
          return;
        }
        
        const sequenceValidation = validateRemakeStageSequence(currentStage, selectedRemakeType, stageRecords);
        if (!sequenceValidation.valid) {
          setValidationError(sequenceValidation.error || 'Invalid stage sequence for remake');
          return;
        }
      }
      
      // Calculate remake number for selected type
      const remakeNumber = selectedRemakeType ? getNextRemakeNumberByType(selectedRemakeType) : undefined;
      
      // Check if this is a R4+ remake (requires escalation) - only for main production
      if (isR4PlusRemake(selectedRemakeType)) {
        // Show escalation dialog before proceeding
        handleOpenRemakeEscalation('main', { quantity: qty, rejectQty: rejectQty, remakeNumber: remakeNumber });
        return;
      }

      const result = await dispatch(trackProduction({
        polDetailId: String(selectedProduct),
        stage: currentStage,
        quantity: qty,
        rejectQuantity: rejectQty,
        category: currentCategory,
        remakeType: selectedRemakeType || undefined,
        remakeCycle: remakeNumber,
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
         polDetailId: String(selectedProduct),
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
        const response = await productionService.getPartProductionStages(part.id);
        // Handle both wrapped response { success, data } and direct data
        const result = response?.data || response;
        console.log('Loaded part production stages for part', part.id, ':', result);
        if (result) {
          setPartStages(result.stages || []);
          
          // Get the workflow stages from the payload (if available)
          const workflowStages = result.workflow?.stages || [];
          console.log(`[handlePartSelect] Workflow stages for part ${part.id}:`, workflowStages);
          
          // Find current stage from records
          let currentStageFound = '';
          result.stages?.forEach((stageData: any) => {
            if (stageData.records && stageData.records.length > 0) {
              currentStageFound = stageData.stage;
            }
          });
          
          // If no records found, use the first stage from the workflow
          if (!currentStageFound && workflowStages.length > 0) {
            currentStageFound = workflowStages[0];
            console.log(`[handlePartSelect] No existing records for part ${part.id}, using first workflow stage: ${currentStageFound}`);
          } else if (!currentStageFound) {
            // Fallback to THROWING if no workflow available
            currentStageFound = 'THROWING';
            console.log(`[handlePartSelect] No workflow available for part ${part.id}, defaulting to THROWING`);
          }
          
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

   // Handle part stage selection with detail process loading
   const handlePartStageSelect = (stage: string) => {
     setPartCurrentStage(stage);
     
     // Load detail processes for selected stage
     const selectedStageData = allStages.find(s => s.code === stage);
     if (selectedStageData?.hasDetailProcess) {
       stageService.getProcessesByStageId(selectedStageData.id)
         .then(processes => {
           setPartDetailProcesses(processes);
         })
         .catch(error => {
           console.error('Error loading detail processes:', error);
           setPartDetailProcesses([]);
         });
     } else {
       setPartDetailProcesses([]);
     }
     setPartSelectedDetailProcess('');
   };

  const validatePartStageQuantity = (stage: string, qty: number, rejectQty: number, remakeType?: string): { valid: boolean; error?: string } => {
    if (!selectedPart) return { valid: false, error: 'No part selected' };
    
    // Bypass validation for remake types - remakes are allowed beyond normal limits
    if (remakeType === 'RPR' || remakeType === 'RQC') {
      return { valid: true };
    }
    
    // Get workflow stages to determine the actual stage sequence for this product
    let workflowStages = productionWorkflow?.stages || [];
    let workflowType = productionWorkflow?.workflowType || '';
    
    // FALLBACK: If workflow not loaded yet, determine stages from product type
    if (workflowStages.length === 0) {
      const productType = polDetailsData?.productType || '';
      if (productType === 'HAND_BUILT' || productType === 'SLAB_TRAY') {
        workflowType = productType === 'HAND_BUILT' ? 'HANDBUILD' : 'SLAB';
        workflowStages = ['DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];
      }
    }
    
    // CRITICAL: Check if the stage is valid for this product's workflow
    // This check runs even if workflowStages is empty - it will block THROWING/TRIMMING for known non-throwing products
    const isNonThrowingProduct = workflowType === 'HANDBUILD' || workflowType === 'SLAB' ||
                                  polDetailsData?.productType === 'HAND_BUILT' || polDetailsData?.productType === 'SLAB_TRAY';
    
    if (isNonThrowingProduct && (stage === 'THROWING' || stage === 'TRIMMING')) {
      return {
        valid: false,
        error: `Stage "${stageNames[stage] || stage}" is not applicable for this product. This product uses ${workflowType || polDetailsData?.productType || 'HAND_BUILT/SLAB'} workflow which skips THROWING and TRIMMING stages.`
      };
    }
    
    if (workflowStages.length > 0 && !workflowStages.includes(stage)) {
      const skipMsg = isNonThrowingProduct ? 'skips THROWING and TRIMMING stages' : 'has a different workflow';
      return {
        valid: false,
        error: `Stage "${stageNames[stage] || stage}" is not part of this product's workflow (${workflowType || 'unknown'}). This product ${skipMsg}.`
      };
    }
    
    // Get the part's target quantity - use qtyToMake (order + extra buffer) like Input Production
    const orderQty = polDetailsData?.quantity || 0;
    const extraBuffer = polDetailsData?.extraBuffer ?? 15;
    const qtyToMake = Math.round(orderQty + (orderQty * extraBuffer / 100));
    const partTargetQty = selectedPart.partType === 'MAIN' ? qtyToMake : (selectedPart.throwingOrder ? 1 : qtyToMake);
    
    // Get already recorded quantity for this stage
    const currentStageData = partStageRecords[stage];
    const alreadyRecordedQty = currentStageData?.totalQuantity || 0;
    const alreadyRecordedRejects = currentStageData?.records?.reduce((sum: number, r: any) => sum + (r.rejectQuantity || 0), 0) || 0;
    
    // Calculate total after adding new entry (including both good and reject quantities)
    const totalAfterNewEntry = alreadyRecordedQty + qty + alreadyRecordedRejects + rejectQty;
    
    // Find the index of the current stage in the workflow
    const currentStageIndex = workflowStages.indexOf(stage);
    
    // Determine the previous stage based on the workflow (not hardcoded)
    const prevStage = currentStageIndex > 0 ? workflowStages[currentStageIndex - 1] : null;
    
    console.log(`[validatePartStageQuantity] Stage: ${stage}, Index: ${currentStageIndex}, PrevStage: ${prevStage}, WorkflowStages:`, workflowStages);
    
    // For the first stage in the workflow, validate against part target quantity
    if (currentStageIndex === 0) {
      if (totalAfterNewEntry > partTargetQty) {
        return {
          valid: false,
          error: `Total quantity (${totalAfterNewEntry}) cannot exceed quantity to make (${partTargetQty}). Order: ${orderQty} + Extra: ${extraBuffer}% = ${qtyToMake}. Already recorded: ${alreadyRecordedQty} good + ${alreadyRecordedRejects} reject, New entry: ${qty} good + ${rejectQty} reject. Please reduce quantity.`
        };
      }
      return { valid: true };
    }
    
    // For other stages, validate against previous stage's output
    if (prevStage) {
      const prevStageData = partStageRecords[prevStage];
      
      if (!prevStageData || prevStageData.totalQuantity === 0) {
        return {
          valid: false,
          error: `Previous stage (${stageNames[prevStage] || prevStage}) has no recorded quantity. Please complete ${stageNames[prevStage] || prevStage} first.`
        };
      }
      
      // Calculate previous stage's available quantity
      const prevStageAvailableQty = prevStageData.totalQuantity;
      
      // Validate - current stage total should not exceed previous stage's available quantity
      if (totalAfterNewEntry > prevStageAvailableQty) {
        return {
          valid: false,
          error: `Total quantity (${totalAfterNewEntry}) cannot exceed available quantity from ${stageNames[prevStage] || prevStage} (${prevStageAvailableQty} good - rejects are discarded). Already recorded in ${stageNames[stage] || stage}: ${alreadyRecordedQty} good + ${alreadyRecordedRejects} reject, New entry: ${qty} good + ${rejectQty} reject. Please reduce quantity.`
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

      if (!partSelectedOperator) {
        showSnackbar('Please select operator', 'error');
        return;
      }

      // Validate reject reason is required when reject quantity > 0
      const parsedRejectQty = parseInt(partRejectQuantity) || 0;
      if (parsedRejectQty > 0 && !partSelectedDefectReason) {
        showSnackbar('Please select reject reason when reject quantity is greater than 0', 'error');
        return;
      }

      const qty = parseInt(partQuantity);
      const rejectQty = parsedRejectQty;
      
      // Validate (pass remakeType to allow bypass for remakes)
      const validationResult = validatePartStageQuantity(partCurrentStage, qty, rejectQty, partSelectedRemakeType);
      if (!validationResult.valid) {
        const errorMessage = validationResult.error || 'Validation failed';
        setPartValidationError(errorMessage);
        return;
      }
      
      // Validate remake stage sequence (for R2+ remakes)
      if (partSelectedRemakeType) {
        // First validate that normal production exists before allowing remake
        if (!hasNormalProduction()) {
          setPartValidationError('Cannot create remake - no normal production records found. Please complete normal production first before creating remakes.');
          return;
        }
        
        const sequenceValidation = validateRemakeStageSequence(partCurrentStage, partSelectedRemakeType, partStageRecords);
        if (!sequenceValidation.valid) {
          setPartValidationError(sequenceValidation.error || 'Invalid stage sequence for remake');
          return;
        }
      }
      
      // Calculate remake number for selected type
      const remakeNumber = partSelectedRemakeType ? getNextRemakeNumberByType(partSelectedRemakeType) : undefined;
      
      // Check if this is a R4+ remake (requires escalation)
      if (isR4PlusRemake(partSelectedRemakeType)) {
        // Show escalation dialog before proceeding
        handleOpenRemakeEscalation('part', { quantity: qty, rejectQty: rejectQty, remakeNumber: remakeNumber });
        return;
      }

      const result = await productionService.trackPartProduction({
        polDetailId: String(selectedProduct),
        partId: selectedPart.id,
        stage: partCurrentStage,
        quantity: qty,
        rejectQuantity: rejectQty,
        category: partCurrentCategory,
        remakeType: partSelectedRemakeType || undefined,
        remakeCycle: remakeNumber,
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
        // First reload remake cycles, then reload part stages
        await loadRemakeCycles();
        await handlePartSelect(selectedPart);
      }
    } catch (error: any) {
      console.error('Error tracking part production:', error);
      showSnackbar(error.message || 'Failed to track part production', 'error');
    }
  };

  // =====================================================
  // COMBINE PARTS HANDLERS
  // =====================================================

  const loadPartCombinations = async () => {
    try {
      const combinations = await productionService.getPartCombinations(selectedProduct);
      setPartCombinations(combinations || []);
    } catch (error) {
      console.error('Error loading part combinations:', error);
      setPartCombinations([]);
    }
  };

  const handleCombineSubmit = async () => {
    try {
      setCombineLoading(true);
      
      const partIds = Object.keys(selectedPartsForCombine)
        .filter(key => selectedPartsForCombine[key] > 0)
        .map(key => Number(key));
      
      if (partIds.length < 2) {
        showSnackbar('Please select at least 2 parts to combine', 'error');
        return;
      }
      
      const parts = Object.keys(selectedPartsForCombine)
        .filter(key => selectedPartsForCombine[key] > 0)
        .map(key => ({ partId: Number(key), quantity: selectedPartsForCombine[key] }));
      
      await productionService.combineParts({
        polDetailId: String(selectedProduct),
        stage: combineStage,
        parts,
        notes: combineNotes,
      });
      
      showSnackbar('Parts combined successfully', 'success');
      setCombineDialogOpen(false);
      setSelectedPartsForCombine({});
      setCombineNotes('');
      loadPartCombinations();
      
    } catch (error: any) {
      console.error('Error combining parts:', error);
      showSnackbar(error.message || 'Failed to combine parts', 'error');
    } finally {
      setCombineLoading(false);
    }
  };

  const handleOpenCombineDialog = (stage: string) => {
    setCombineStage(stage);
    setCombineCategory(getCategoryForStage(stage));
    setCombineDialogOpen(true);
    setSelectedPartsForCombine({});
    setCombineNotes('');
  };

  const handleCloseCombineDialog = () => {
    setCombineDialogOpen(false);
    setSelectedPartsForCombine({});
    setCombineNotes('');
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Production Tracking
      </Typography>

      {/* POL and Product Selection */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Select POL"
            value={selectedPOL}
            onChange={handlePOLChange}
            required
          >
            <MenuItem value="">-- Select POL --</MenuItem>
            {pols.map((pol: any) => (
              <MenuItem key={pol.id} value={pol.id}>
                {pol.poNumber} - {pol.clientName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Select Product"
            value={selectedProduct}
            onChange={handleProductChange}
            required
            disabled={!selectedPOL}
          >
            <MenuItem value="">-- Select Product --</MenuItem>
            {polDetails.map((detail: any) => (
              <MenuItem key={detail.id} value={detail.id}>
                {detail.productCode} - {detail.productName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      {selectedProduct && (
        <>
          {/* Extra Buffer and Quantity Display */}
          {polDetailsData && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Order Quantity: <strong>{polDetailsData.quantity || 0}</strong>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Extra Buffer: <strong>{polDetailsData.extraBuffer ?? 15}%</strong>
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Qty to Make: <strong>{Math.round((polDetailsData.quantity || 0) + ((polDetailsData.quantity || 0) * (polDetailsData.extraBuffer ?? 15) / 100))}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Main Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Input Production" value="input-production" />
              <Tab label="Part Production" value="part-production" />
              <Tab label="Combine Parts" value="combine-parts" />
              <Tab label="Production History" value="history" />
              <Tab label="Remake History" value="remake-history" />
            </Tabs>
          </Box>

          {/* Input Production Tab */}
          {tabValue === 'input-production' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Record Production
                    </Typography>

                    {/* Category Tabs - FORMING is hidden for HAND_BUILT/SLAB_TRAY products */}
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                      <Tabs value={categoryTab} onChange={handleCategoryTabChange} variant="scrollable">
                        {categories.map((cat, index) => {
                          // Skip FORMING tab for non-throwing products
                          if (cat === 'FORMING' && isNonThrowingProduct) {
                            return null;
                          }
                          return (
                            <Tab
                              key={cat}
                              label={categoryLabels[cat]}
                              sx={{
                                bgcolor: categoryColors[cat] + '20',
                                mr: 1,
                                borderRadius: 1,
                              }}
                            />
                          );
                        })}
                      </Tabs>
                    </Box>

                    {/* Stage Selection */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Stage:</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {getStagesForCategory(currentCategory).map(stage => (
                          <Chip
                            key={stage}
                            label={stageNames[stage]}
                            onClick={() => handleStageSelect(stage)}
                            color={currentStage === stage ? 'primary' : 'default'}
                            variant={currentStage === stage ? 'filled' : 'outlined'}
                          />
                        ))}
                      </Box>
                    </Box>

                    {/* Detail Process Dropdown (when available for selected stage) */}
                    {detailProcesses.length > 0 && (
                      <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel>Detail Process</InputLabel>
                        <Select
                          value={selectedDetailProcess}
                          onChange={(e) => setSelectedDetailProcess(e.target.value)}
                          label="Detail Process"
                        >
                          <MenuItem value="">-- Select Process --</MenuItem>
                          {detailProcesses.map(process => (
                            <MenuItem key={process.id} value={process.id}>
                              {process.processName}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Good Quantity"
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Reject Quantity"
                          type="number"
                          value={rejectQuantity}
                          onChange={(e) => setRejectQuantity(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Production Date"
                          type="date"
                          value={productionDate}
                          onChange={(e) => setProductionDate(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Operator</InputLabel>
                          <Select
                            value={selectedOperator}
                            onChange={(e) => setSelectedOperator(e.target.value)}
                            label="Operator"
                          >
                            <MenuItem value="">-- Select Operator --</MenuItem>
                            {operators.map((op: any) => (
                              <MenuItem key={op.id} value={op.id}>{op.fullName}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {/* Oven selection for firing stages */}
                      {firingStages.includes(currentStage) && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Oven</InputLabel>
                            <Select
                              value={selectedOven}
                              onChange={(e) => setSelectedOven(e.target.value)}
                              label="Oven"
                            >
                              <MenuItem value="">-- Select Oven --</MenuItem>
                              {ovens.map((oven: any) => (
                                <MenuItem key={oven.id} value={oven.id}>{oven.name}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      {/* Reject Reason dropdown - shown when reject quantity > 0 */}
                      {parseInt(rejectQuantity) > 0 && (
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth required>
                            <InputLabel>Reject Reason</InputLabel>
                            <Select
                              value={selectedDefectReason}
                              onChange={(e) => setSelectedDefectReason(e.target.value)}
                              label="Reject Reason"
                            >
                              <MenuItem value="">-- Select Reject Reason --</MenuItem>
                              {defectReasons.map((reason: any) => (
                                <MenuItem key={reason.id} value={reason.id}>
                                  {reason.category} - {reason.description}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      )}

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Notes"
                          multiline
                          rows={2}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Optional notes about this production entry"
                        />
                      </Grid>
                    </Grid>

                    {validationError && (
                      <MuiAlert severity="error" sx={{ mt: 2 }} onClose={() => setValidationError('')}>
                        {validationError}
                      </MuiAlert>
                    )}

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        onClick={handleSubmit}
                        startIcon={<SaveIcon />}
                        size="large"
                      >
                        Save Production
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                {/* Stage Progress Card */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Production Progress
                    </Typography>
                    {Object.entries(stageRecords).map(([stage, data]: [string, any]) => (
                      <Box key={stage} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{stageNames[stage] || stage}</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {data.totalQuantity || 0}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(100, ((data.totalQuantity || 0) / (polDetailsData?.quantity || 1)) * 100)} 
                          sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                        />
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Part Production Tab */}
          {tabValue === 'part-production' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Product Parts</Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddPartDialog}
                      >
                        Add Part
                      </Button>
                    </Box>
                    
                    {productParts.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">
                          No parts created yet. Click "Add Part" to create one.
                        </Typography>
                      </Box>
                    ) : (
                      <List dense>
                        {productParts.map((part: any) => (
                          <ListItem
                            key={part.id}
                            button
                            selected={selectedPart?.id === part.id}
                            onClick={() => handlePartSelect(part)}
                            sx={{
                              borderRadius: 1,
                              mb: 0.5,
                              border: '1px solid',
                              borderColor: selectedPart?.id === part.id ? 'primary.main' : 'divider',
                              bgcolor: selectedPart?.id === part.id ? 'action.selected' : 'background.paper',
                            }}
                            secondaryAction={
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenEditPartDialog(part); }}>
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeletePart(part.id); }}>
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            }
                          >
                            <ListItemText
                              primary={part.partName}
                              secondary={
                                <Box component="span" sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
                                  <Chip label={part.partType} size="small" />
                                  {part.throwingRequired && (
                                    <Chip label="Throwing" size="small" color="primary" variant="outlined" />
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={8}>
                {selectedPart ? (
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                          Track: {selectedPart.partName}
                        </Typography>
                        <Chip 
                          label={selectedPart.partType} 
                          color={selectedPart.partType === 'MAIN' ? 'primary' : 'default'}
                        />
                      </Box>
                      
                      {/* Category Tabs for Part */}
                      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs 
                          value={categories.indexOf(partCurrentCategory)} 
                          onChange={handlePartCategoryTabChange}
                          variant="scrollable"
                        >
                          {categories.map((cat) => (
                            <Tab 
                              key={cat} 
                              label={categoryLabels[cat]}
                              sx={{ bgcolor: categoryColors[cat] + '20', mr: 1, borderRadius: 1 }}
                            />
                          ))}
                        </Tabs>
                      </Box>
                      
                      {/* Stage Selection for Part */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Stage:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {getStagesForCategory(partCurrentCategory).map(stage => (
                            <Chip
                              key={stage}
                              label={stageNames[stage]}
                              onClick={() => handlePartStageSelect(stage)}
                              color={partCurrentStage === stage ? 'primary' : 'default'}
                              variant={partCurrentStage === stage ? 'filled' : 'outlined'}
                            />
                          ))}
                        </Box>
                      </Box>
                      
                      {/* Detail Process Dropdown for Part */}
                      {partDetailProcesses.length > 0 && (
                        <FormControl fullWidth sx={{ mb: 3 }}>
                          <InputLabel>Detail Process</InputLabel>
                          <Select
                            value={partSelectedDetailProcess}
                            onChange={(e) => setPartSelectedDetailProcess(e.target.value)}
                            label="Detail Process"
                          >
                            <MenuItem value="">-- Select Process --</MenuItem>
                            {partDetailProcesses.map(process => (
                              <MenuItem key={process.id} value={process.id}>
                                {process.processName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      )}
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Good Quantity"
                            type="number"
                            value={partQuantity}
                            onChange={(e) => setPartQuantity(e.target.value)}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Reject Quantity"
                            type="number"
                            value={partRejectQuantity}
                            onChange={(e) => setPartRejectQuantity(e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Production Date"
                            type="date"
                            value={partProductionDate}
                            onChange={(e) => setPartProductionDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                            required
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth required>
                            <InputLabel>Operator</InputLabel>
                            <Select
                              value={partSelectedOperator}
                              onChange={(e) => setPartSelectedOperator(e.target.value)}
                              label="Operator"
                            >
                              <MenuItem value="">-- Select Operator --</MenuItem>
                              {operators.map((op: any) => (
                                <MenuItem key={op.id} value={op.id}>{op.fullName}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        
                        {/* Oven selection for firing stages in Part */}
                        {firingStages.includes(partCurrentStage) && (
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth>
                              <InputLabel>Oven</InputLabel>
                              <Select
                                value={partSelectedOven}
                                onChange={(e) => setPartSelectedOven(e.target.value)}
                                label="Oven"
                              >
                                <MenuItem value="">-- Select Oven --</MenuItem>
                                {ovens.map((oven: any) => (
                                  <MenuItem key={oven.id} value={oven.id}>{oven.name}</MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}

                        {/* Reject Reason dropdown for Part - shown when reject quantity > 0 */}
                        {parseInt(partRejectQuantity) > 0 && (
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth required>
                              <InputLabel>Reject Reason</InputLabel>
                              <Select
                                value={partSelectedDefectReason}
                                onChange={(e) => setPartSelectedDefectReason(e.target.value)}
                                label="Reject Reason"
                              >
                                <MenuItem value="">-- Select Reject Reason --</MenuItem>
                                {defectReasons.map((reason: any) => (
                                  <MenuItem key={reason.id} value={reason.id}>
                                    {reason.category} - {reason.description}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                        
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={2}
                            value={partNotes}
                            onChange={(e) => setPartNotes(e.target.value)}
                            placeholder="Optional notes about this production entry"
                          />
                        </Grid>
                      </Grid>
                      
                      {partValidationError && (
                        <MuiAlert severity="error" sx={{ mt: 2 }} onClose={() => setPartValidationError('')}>
                          {partValidationError}
                        </MuiAlert>
                      )}
                      
                      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          onClick={handlePartSubmit}
                          startIcon={<SaveIcon />}
                          size="large"
                        >
                          Save Part Production
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                ) : (
                  <Card sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <BuildIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        Select a part to track production
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Choose a part from the list on the left, or add a new part
                      </Typography>
                    </Box>
                  </Card>
                )}
              </Grid>
            </Grid>
          )}

          {/* Combine Parts Tab */}
          {tabValue === 'combine-parts' && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Select Parts to Combine</Typography>
                    
                    {productParts.length < 2 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">
                          You need at least 2 parts to combine. Please add more parts first.
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {/* Stage Selection */}
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Select Stage</InputLabel>
                          <Select
                            value={combineStage}
                            onChange={(e) => {
                              setCombineStage(e.target.value);
                              setCombineCategory(getCategoryForStage(e.target.value));
                            }}
                            label="Select Stage"
                          >
                            <MenuItem value="">-- Select Stage --</MenuItem>
                            {categories.flatMap(cat => 
                              (categoryStages[cat] || []).map(stage => (
                                <MenuItem key={stage} value={stage}>
                                  {categoryLabels[cat]} - {stageNames[stage]}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                        
                        {/* Parts Selection */}
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Select Parts:</Typography>
                        {productParts.map((part: any) => (
                          <Box key={part.id} sx={{ mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography sx={{ flex: 1 }}>{part.partName}</Typography>
                              <TextField
                                type="number"
                                size="small"
                                sx={{ width: 100 }}
                                placeholder="Qty"
                                value={selectedPartsForCombine[part.id] || ''}
                                onChange={(e) => setSelectedPartsForCombine({
                                  ...selectedPartsForCombine,
                                  [part.id]: parseInt(e.target.value) || 0,
                                })}
                              />
                            </Box>
                          </Box>
                        ))}
                        
                        {/* Notes */}
                        <TextField
                          fullWidth
                          label="Notes"
                          multiline
                          rows={2}
                          value={combineNotes}
                          onChange={(e) => setCombineNotes(e.target.value)}
                          placeholder="Optional notes about this combination"
                          sx={{ mb: 2 }}
                        />
                        
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleCombineSubmit}
                          disabled={combineLoading || !combineStage || Object.keys(selectedPartsForCombine).length < 2}
                          startIcon={combineLoading ? <RefreshIcon /> : <SaveIcon />}
                        >
                          {combineLoading ? 'Combining...' : 'Combine Parts'}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Combination History</Typography>
                    
                    {partCombinations.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <InfoIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                        <Typography color="text.secondary">
                          No combinations recorded yet
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                              <TableCell><strong>Stage</strong></TableCell>
                              <TableCell><strong>Parts</strong></TableCell>
                              <TableCell><strong>Date</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {partCombinations.map((combo: any, index: number) => (
                              <TableRow key={index}>
                                <TableCell>{stageNames[combo.stage] || combo.stage}</TableCell>
                                <TableCell>
                                  {combo.parts?.map((p: any) => `${p.partName} (${p.quantity})`).join(', ')}
                                </TableCell>
                                <TableCell>{combo.createdAt ? format(new Date(combo.createdAt), 'dd/MM/yyyy') : '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Production History Tab */}
          {tabValue === 'history' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Production History</Typography>
                
                {Object.keys(stageRecords).length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No production records yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Production history will appear here after you record production data
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                          <TableCell><strong>Stage</strong></TableCell>
                          <TableCell><strong>Category</strong></TableCell>
                          <TableCell><strong>Total Qty</strong></TableCell>
                          <TableCell><strong>Records</strong></TableCell>
                          <TableCell><strong>Last Updated</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(stageRecords).map(([stage, data]: [string, any]) => (
                          <TableRow key={stage} hover>
                            <TableCell>
                              <Chip 
                                label={stageNames[stage] || stage} 
                                color={getCategoryForStage(stage) === 'FIRING' ? 'error' : 'primary'}
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={categoryLabels[getCategoryForStage(stage)] || getCategoryForStage(stage)}
                                size="small"
                                sx={{ bgcolor: categoryColors[getCategoryForStage(stage)] + '20' }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" fontWeight="bold">
                                {data.totalQuantity || 0}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={`${data.records?.length || 0} entries`} 
                                size="small"
                                color="default"
                              />
                            </TableCell>
                            <TableCell>
                              {data.records && data.records.length > 0 && data.records[0].createdAt ? (
                                <Typography variant="body2">
                                  {format(new Date(data.records[0].createdAt), 'dd/MM/yyyy HH:mm')}
                                </Typography>
                              ) : (
                                <Typography variant="body2" color="text.secondary">-</Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          )}

          {/* Remake History Tab */}
          {tabValue === 'remake-history' && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>Remake Cycles History</Typography>
                    
                    {/* Remake Summary Cards */}
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
                          <Typography variant="subtitle2" color="text.secondary">RPR (Pre-Firing) Remakes</Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {getTotalRemadeQtyByType('RPR')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total pieces remade (R1-R{getNextRemakeNumberByType('RPR') - 1})
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, bgcolor: '#e3f2fd' }}>
                          <Typography variant="subtitle2" color="text.secondary">RQC (Post-Firing) Remakes</Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {getTotalRemadeQtyByType('RQC')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total pieces remade (R1-R{getNextRemakeNumberByType('RQC') - 1})
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: 2, bgcolor: '#fce4ec' }}>
                          <Typography variant="subtitle2" color="text.secondary">Total Remakes</Typography>
                          <Typography variant="h4" fontWeight="bold">
                            {getTotalRemadeQtyByType('RPR') + getTotalRemadeQtyByType('RQC')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Combined total of all remakes
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    {/* Remake Cycles Table */}
                    {remakeCycles.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <InfoIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" color="text.secondary">
                          No remake records yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Remake history will appear here when production rejects are recorded
                        </Typography>
                      </Box>
                    ) : (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                              <TableCell><strong>Remake Type</strong></TableCell>
                              <TableCell><strong>Cycle #</strong></TableCell>
                              <TableCell><strong>Stage</strong></TableCell>
                              <TableCell><strong>Quantity</strong></TableCell>
                              <TableCell><strong>Status</strong></TableCell>
                              <TableCell><strong>Created</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {remakeCycles.map((cycle: any, index: number) => (
                              <TableRow key={index} hover>
                                <TableCell>
                                  <Chip 
                                    label={cycle.remakeType} 
                                    color={cycle.remakeType === 'RPR' ? 'warning' : 'info'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">
                                    R{cycle.remakeNumber}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={stageNames[cycle.rejectStage] || cycle.rejectStage} 
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight="bold">
                                    {cycle.rejectQuantity}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={cycle.status} 
                                    color={cycle.status === 'ESCALATED' ? 'error' : 'success'}
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {cycle.createdAt ? format(new Date(cycle.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* Snackbar */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleSnackbarClose} severity={snackbarSeverity as any} sx={{ width: '100%' }}>
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      {/* Remake Escalation Dialog */}
      <Dialog open={remakeEscalationDialogOpen} onClose={handleCloseRemakeEscalation} maxWidth="md" fullWidth>
        <DialogTitle>
          <WarningIcon color="warning" sx={{ mr: 1, verticalAlign: 'middle' }} />
          R4+ Remake Escalation Required
        </DialogTitle>
        <DialogContent>
          <MuiAlert severity="warning" sx={{ mb: 3 }}>
            This is a R4+ remake (4th or more remake cycle). Investigation notes are required before proceeding.
          </MuiAlert>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Please enter investigation notes explaining why this remake is needed, root cause analysis, and corrective actions:
          </Typography>
          <TextField
            fullWidth
            label="Investigation Notes"
            multiline
            rows={4}
            value={remakeEscalationNotes}
            onChange={(e) => setRemakeEscalationNotes(e.target.value)}
            required
            placeholder="Describe the issue, root cause, and what steps will be taken to prevent this in future..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRemakeEscalation}>Cancel</Button>
          <Button onClick={handleConfirmRemakeEscalation} variant="contained" color="warning">
            Confirm and Proceed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={addPartDialogOpen} onClose={handleCloseAddPartDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Part</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Part Name"
                value={newPartName}
                onChange={(e) => setNewPartName(e.target.value)}
                required
                placeholder="e.g., Body, Handle, Lid"
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
                  <MenuItem value="MAIN">Main</MenuItem>
                  <MenuItem value="SUB">Sub</MenuItem>
                  <MenuItem value="ACCESSORY">Accessory</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Throwing Order"
                type="number"
                value={newPartThrowingOrder}
                onChange={(e) => setNewPartThrowingOrder(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="1, 2, 3..."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={newPartThrowingRequired}
                    onChange={(e) => setNewPartThrowingRequired(e.target.checked)}
                  />
                }
                label="Throwing Required"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddPartDialog}>Cancel</Button>
          <Button onClick={handleAddPart} variant="contained" disabled={!newPartName.trim()}>
            Add Part
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Part Dialog */}
      <Dialog open={editPartDialogOpen} onClose={handleCloseEditPartDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Part</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Part Name"
                value={editPartName}
                onChange={(e) => setEditPartName(e.target.value)}
                required
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
                  <MenuItem value="MAIN">Main</MenuItem>
                  <MenuItem value="SUB">Sub</MenuItem>
                  <MenuItem value="ACCESSORY">Accessory</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Throwing Order"
                type="number"
                value={editPartThrowingOrder}
                onChange={(e) => setEditPartThrowingOrder(e.target.value ? parseInt(e.target.value) : '')}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editPartThrowingRequired}
                    onChange={(e) => setEditPartThrowingRequired(e.target.checked)}
                  />
                }
                label="Throwing Required"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditPartDialog}>Cancel</Button>
          <Button onClick={handleUpdatePart} variant="contained" disabled={!editPartName.trim()}>
            Update Part
          </Button>
        </DialogActions>
      </Dialog>

      {/* Combine Parts Dialog */}
      <Dialog open={combineDialogOpen} onClose={handleCloseCombineDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Combine Parts at {stageNames[combineStage] || combineStage}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select parts and quantities to combine for {categoryLabels[combineCategory]} stage.
          </Typography>
          {productParts.map((part: any) => (
            <Box key={part.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography sx={{ flex: 1 }}>{part.partName}</Typography>
              <TextField
                type="number"
                size="small"
                sx={{ width: 100 }}
                placeholder="Qty"
                value={selectedPartsForCombine[part.id] || ''}
                onChange={(e) => setSelectedPartsForCombine({
                  ...selectedPartsForCombine,
                  [part.id]: parseInt(e.target.value) || 0,
                })}
              />
            </Box>
          ))}
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={2}
            value={combineNotes}
            onChange={(e) => setCombineNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCombineDialog}>Cancel</Button>
          <Button 
            onClick={handleCombineSubmit} 
            variant="contained" 
            disabled={combineLoading}
            startIcon={combineLoading ? <RefreshIcon /> : undefined}
          >
            {combineLoading ? 'Combining...' : 'Combine'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductionTracking;
