import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  AlertTitle,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { reportService } from '../services/api';

interface ReportData {
  poNumber: string;
  client: string;
  orderQty: number;
  delivered: number;
  status: string;
  onTime: boolean | null;
}

const Reports = (): JSX.Element => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [reportType, setReportType] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');

  // Filters
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const reportTypes = [
    { value: 'pol-summary', label: 'POL Order Summary', description: 'Overview of all POL orders with delivery status' },
    { value: 'forming', label: 'Forming Analysis', description: 'Detailed analysis of forming stage production' },
    { value: 'qc', label: 'QC Analysis', description: 'Quality control metrics and reject rates' },
    { value: 'production', label: 'Production Progress', description: 'Overall production progress across all stages' },
    { value: 'logbook', label: 'Logbook Summary', description: 'Summary of logbook entries and issues' },
    { value: 'alerts', label: 'Alerts Summary', description: 'Summary of all alerts and resolutions' },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) {
      setError('Please select a report type');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const filters: any = {};
      if (dateFrom) filters.dateFrom = dateFrom;
      if (dateTo) filters.dateTo = dateTo;
      if (clientFilter !== 'all') filters.client = clientFilter;

      const result = await reportService.generate(reportType, filters);
      setReportData(result.data || result);
      setSuccess('Report generated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExportFormat(format);
    setExportDialogOpen(true);
  };

  const confirmExport = async () => {
    setExportDialogOpen(false);
    setLoading(true);
    try {
      const blob = await reportService.export('current-report', exportFormat);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report.${exportFormat === 'excel' ? 'xlsx' : exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      setSuccess('Report exported successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to export report');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async () => {
    setLoading(true);
    try {
      const history = await reportService.getHistory();
      // In a real app, this would show a dialog with report history
      console.log('Report history:', history);
      setSuccess('Report history loaded');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to load report history');
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (delivered: number, orderQty: number) => {
    if (orderQty === 0) return 0;
    return Math.round((delivered / orderQty) * 100);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        📊 Reports & Analytics
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {generating && <LinearProgress sx={{ mb: 3 }} />}

      <Grid container spacing={3}>
        {/* Report Configuration */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Generate Report</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  label="Report Type"
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {reportTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography>{type.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{type.description}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>Filters</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    label="From"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    type="date"
                    size="small"
                    label="To"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Client</InputLabel>
                    <Select
                      value={clientFilter}
                      label="Client"
                      onChange={(e) => setClientFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Clients</MenuItem>
                      <MenuItem value="abc">ABC Corp</MenuItem>
                      <MenuItem value="xyz">XYZ Ltd</MenuItem>
                      <MenuItem value="123">123 Inc</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button
                variant="contained"
                fullWidth
                onClick={handleGenerateReport}
                disabled={generating || !reportType}
                sx={{ mt: 3 }}
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Options */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Export Options</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<PdfIcon />}
                  onClick={() => handleExport('pdf')}
                  disabled={reportData.length === 0}
                >
                  Export PDF
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExcelIcon />}
                  onClick={() => handleExport('excel')}
                  disabled={reportData.length === 0}
                >
                  Export Excel
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CsvIcon />}
                  onClick={() => handleExport('csv')}
                  disabled={reportData.length === 0}
                >
                  Export CSV
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleViewHistory}
                >
                  View History
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Report Results */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Report Results
                {reportType && (
                  <Chip
                    label={reportTypes.find(t => t.value === reportType)?.label}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>

              {reportData.length === 0 ? (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Select a report type and click "Generate Report" to view results
                  </Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>PO Number</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell align="center">Order Qty</TableCell>
                      <TableCell align="center">Delivered</TableCell>
                      <TableCell>Progress</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>On-Time</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.poNumber}</TableCell>
                        <TableCell>{row.client}</TableCell>
                        <TableCell align="center">{row.orderQty}</TableCell>
                        <TableCell align="center">{row.delivered}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={calculateProgress(row.delivered, row.orderQty)}
                              sx={{ width: 80, height: 6, borderRadius: 3 }}
                            />
                            <Typography variant="caption">
                              {calculateProgress(row.delivered, row.orderQty)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status}
                            color={row.status === 'Completed' ? 'success' : row.status === 'In Progress' ? 'warning' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {row.onTime === null ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : (
                            <Chip
                              label={row.onTime ? 'Yes' : 'No'}
                              color={row.onTime ? 'success' : 'error'}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Stats */}
        {reportData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Summary Statistics</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6} md={2}>
                    <Typography variant="subtitle2" color="text.secondary">Total Orders</Typography>
                    <Typography variant="h5">{reportData.length}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Total Order Quantity</Typography>
                    <Typography variant="h5">{reportData.reduce((sum, r) => sum + r.orderQty, 0)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">Total Delivered</Typography>
                    <Typography variant="h5">{reportData.reduce((sum, r) => sum + r.delivered, 0)}</Typography>
                  </Grid>
                  <Grid item xs={6} md={2}>
                    <Typography variant="subtitle2" color="text.secondary">Completion Rate</Typography>
                    <Typography variant="h5" color="success.main">
                      {Math.round((reportData.reduce((sum, r) => sum + r.delivered, 0) / reportData.reduce((sum, r) => sum + r.orderQty, 0)) * 100)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Typography variant="subtitle2" color="text.secondary">On-Time Rate</Typography>
                    <Typography variant="h5" color="primary.main">
                      {Math.round((reportData.filter(r => r.onTime === true).length / reportData.filter(r => r.onTime !== null).length) * 100)}%
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Export Confirmation Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)}>
        <DialogTitle>Confirm Export</DialogTitle>
        <DialogContent>
          <Typography>
            Export report as {exportFormat.toUpperCase()}?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmExport} disabled={loading}>
            {loading ? 'Exporting...' : 'Export'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
