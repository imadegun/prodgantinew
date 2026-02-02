import React from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Button, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress, Chip, Stepper, Step, StepLabel } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const productionStages = ['Throwing', 'Trimming', 'Decoration', 'Drying', 'Load Bisque', 'Out Bisque', 'Load High Firing', 'Out High Firing', 'Sanding', 'Waxing', 'Dipping', 'Spraying', 'Color Decoration', 'QC - Good', 'QC - Reject'];

const ProductionTracking: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        🏭 Production Tracking
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Select POL & Product</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>POL</InputLabel>
                <Select label="POL">
                  <MenuItem value="1">PO-2026-001 - ABC Corp</MenuItem>
                  <MenuItem value="2">PO-2026-002 - XYZ Ltd</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select label="Product">
                  <MenuItem value="1">Teapot (Main Body)</MenuItem>
                  <MenuItem value="2">Teapot (Lid)</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Production Progress</Typography>
              <Stepper alternativeLabel>
                {['Forming', 'Firing', 'Glazing', 'QC'].map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              <LinearProgress variant="determinate" value={60} sx={{ mt: 3, height: 10, borderRadius: 5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                Overall Progress: 60%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Enter Production Data</Typography>
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
                  <TableRow>
                    <TableCell>Throwing</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell><TextField size="small" type="number" defaultValue={50} sx={{ width: 100 }} /></TableCell>
                    <TableCell><TextField size="small" type="number" defaultValue={0} sx={{ width: 80 }} /></TableCell>
                    <TableCell><TextField size="small" sx={{ width: 200 }} /></TableCell>
                    <TableCell><Chip label="Completed" color="success" size="small" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Trimming</TableCell>
                    <TableCell>50</TableCell>
                    <TableCell><TextField size="small" type="number" defaultValue={48} sx={{ width: 100 }} /></TableCell>
                    <TableCell><TextField size="small" type="number" defaultValue={2} sx={{ width: 80 }} /></TableCell>
                    <TableCell><TextField size="small" sx={{ width: 200 }} /></TableCell>
                    <TableCell><Chip label="In Progress" color="warning" size="small" /></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" startIcon={<SaveIcon />}>
                  Save Production Data
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductionTracking;
