import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Stepper, Step, StepLabel, Button, TextField, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Add as AddIcon } from '@mui/icons-material';

const steps = ['POL Details', 'Add Products', 'Review & Confirm'];

const POLCreate: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

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
                  <TextField fullWidth label="Client Name" required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="PO Number" placeholder="Auto-generated if empty" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="date" label="PO Date" InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="date" label="Delivery Date" required InputLabelProps={{ shrink: true }} />
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Step 2: Add Products</Typography>
              <TextField fullWidth placeholder="Search products by code or name..." sx={{ mb: 3 }} />
              <Button variant="outlined" startIcon={<AddIcon />}>
                Add Product from gayafusionall
              </Button>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 3 }}>Step 3: Review & Confirm</Typography>
              <Typography color="text.secondary">Review your POL details before creating.</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  Create POL
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
    </Box>
  );
};

export default POLCreate;
