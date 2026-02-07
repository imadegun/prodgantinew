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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Alert as MuiAlert,
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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { fetchProductionStages, trackProduction } from '../store/slices/productionSlice';
import { fetchPOLs } from '../store/slices/polSlice';

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

const ProductionTracking = () => {
  const dispatch = useAppDispatch();
  const { pols } = useAppSelector((state) => state.pol);
   
  const [selectedPOL, setSelectedPOL] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentStage, setCurrentStage] = useState('THROWING');
  const [quantity, setQuantity] = useState('');
  const [rejectQuantity, setRejectQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [expanded, setExpanded] = useState<string | false>(false);
  const [discrepancyAlert, setDiscrepancyAlert] = useState<any>(null);
 
  useEffect(() => {
    dispatch(fetchPOLs({ page: 1, limit: 50 }));
  }, [dispatch]);
 
  const handlePOLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPOL(event.target.value);
  };
 
  const handleProductChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedProduct(event.target.value);
  };
 
  const handleStageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentStage(event.target.value);
  };
 
  const handleSubmit = async () => {
    try {
      const result = await dispatch(trackProduction({
        polDetailId: selectedProduct,
        stage: currentStage,
        quantity: parseInt(quantity),
        rejectQuantity: parseInt(rejectQuantity) || 0,
        notes,
      }));
 
      if (result.payload?.discrepancyDetected) {
        setDiscrepancyAlert(result.payload);
      } else {
        setQuantity('');
        setRejectQuantity('');
        setNotes('');
      }
    } catch (error) {
      console.error('Error tracking production:', error);
    }
  };
 
  const handleAlertClose = () => {
    setDiscrepancyAlert(null);
  };
 
  const handleAccordionChange = (panel: string) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };
 
  const stages = [
    'THROWING',
    'TRIMMING',
    'DECORATION',
    'DRYING',
    'LOAD_BISQUE',
    'OUT_BISQUE',
    'LOAD_HIGH_FIRING',
    'OUT_HIGH_FIRING',
    'LOAD_RAKU_FIRING',
    'OUT_RAKU_FIRING',
    'LOAD_LUSTER_FIRING',
    'OUT_LUSTER_FIRING',
    'SANDING',
    'WAXING',
    'DIPPING',
    'SPRAYING',
    'COLOR_DECORATION',
    'QC_GOOD',
    'QC_REJECT',
    'QC_RE_FIRING',
    'QC_SECOND',
  ];
 
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
                {/* This would be populated from POL details */}
                <option value="sample-product-1">Sample Product 1</option>
                <option value="sample-product-2">Sample Product 2</option>
              </TextField>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
 
      {/* Production Stages */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Production Stages</Typography>
          
          <Box sx={{ mt: 3 }}>
            <Stepper activeStep={stages.indexOf(currentStage)} alternativeLabel>
              {stages.map((stage) => (
                <Step key={stage}>
                  <StepLabel>{stageNames[stage]}</StepLabel>
                  <StepContent>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, minHeight: 100 }}>
                      <Typography variant="body2" color="textSecondary">
                        {stageNames[stage]}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Quantity"
                              type="number"
                              value={quantity}
                              onChange={(e) => setQuantity(e.target.value)}
                              disabled={stage !== currentStage}
                            />
                          </Grid>
                          <Grid item xs={6}>
                            <TextField
                              fullWidth
                              label="Rejects"
                              type="number"
                              value={rejectQuantity}
                              onChange={(e) => setRejectQuantity(e.target.value)}
                              disabled={stage !== currentStage}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Notes"
                              multiline
                              rows={2}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              disabled={stage !== currentStage}
                            />
                          </Grid>
                        </Grid>
                        </Box>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
          </Box>
          
          {currentStage && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<SaveIcon />}
                onClick={handleSubmit}
                disabled={!quantity || parseInt(quantity) <= 0}
              >
                Save Production Data
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
 
      {/* Discrepancy Alert Dialog */}
      <Dialog open={Boolean(discrepancyAlert)} onClose={handleAlertClose}>
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
    </Box>
  );
};

export default ProductionTracking;
