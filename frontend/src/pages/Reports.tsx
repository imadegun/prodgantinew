import React from 'react';
import { Box, Typography, Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem, Button, Table, TableBody, TableCell, TableHead, TableRow, LinearProgress } from '@mui/material';
import { PictureAsPdf as PdfIcon, TableChart as ExcelIcon, Description as CsvIcon } from '@mui/icons-material';

const Reports: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        📊 Reports & Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Generate Report</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Report Type</InputLabel>
                <Select label="Report Type">
                  <MenuItem value="pol-summary">POL Order Summary</MenuItem>
                  <MenuItem value="forming">Forming Analysis</MenuItem>
                  <MenuItem value="qc">QC Analysis</MenuItem>
                  <MenuItem value="production">Production Progress</MenuItem>
                  <MenuItem value="logbook">Logbook Summary</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" fullWidth>
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Export Options</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" startIcon={<PdfIcon />}>Export PDF</Button>
                <Button variant="outlined" startIcon={<ExcelIcon />}>Export Excel</Button>
                <Button variant="outlined" startIcon={<CsvIcon />}>Export CSV</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Sample Report - POL Summary</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PO Number</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Order Qty</TableCell>
                    <TableCell>Delivered</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>On-Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>PO-2026-001</TableCell>
                    <TableCell>ABC Corp</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell sx={{ color: 'success.main' }}>Yes</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PO-2026-002</TableCell>
                    <TableCell>XYZ Ltd</TableCell>
                    <TableCell>250</TableCell>
                    <TableCell>150</TableCell>
                    <TableCell>In Progress</TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>PO-2026-003</TableCell>
                    <TableCell>123 Inc</TableCell>
                    <TableCell>75</TableCell>
                    <TableCell>75</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell sx={{ color: 'error.main' }}>No</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports;
