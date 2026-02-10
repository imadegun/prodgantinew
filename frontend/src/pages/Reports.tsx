import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useAppSelector, useAppDispatch } from '../hooks/useAppSelector';
import { generatePOLSummaryReport, generateFormingAnalysisReport, generateQCAnalysisReport, generateProductionProgressReport } from '../store/slices/reportSlice';

const Reports = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.reports);

  const [reportType, setReportType] = useState('POL_SUMMARY');
  const [format, setFormat] = useState('JSON');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  const handleGenerateReport = async () => {
    try {
      let reportData;

      switch (reportType) {
        case 'POL_SUMMARY':
          reportData = await dispatch(generatePOLSummaryReport({
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          }));
          break;
        case 'FORMING_ANALYSIS':
          reportData = await dispatch(generateFormingAnalysisReport({
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          }));
          break;
        case 'QC_ANALYSIS':
          reportData = await dispatch(generateQCAnalysisReport({
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          }));
          break;
        case 'PRODUCTION_PROGRESS':
          reportData = await dispatch(generateProductionProgressReport({
            fromDate: fromDate || undefined,
            toDate: toDate || undefined,
          }));
          break;
        default:
          alert('Please select a report type');
          return;
      }

      setGeneratedReport(reportData);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report. Please try again.');
    }
  };

  const handleDownload = () => {
    if (!generatedReport) {
      alert('Please generate a report first');
      return;
    }

    let content = '';
    let filename = '';
    let type = 'text/plain';

    switch (format) {
      case 'JSON':
        content = JSON.stringify(generatedReport, null, 2);
        filename = `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.json`;
        type = 'application/json';
        break;
      case 'CSV':
        content = generateCSV(generatedReport);
        filename = `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.csv`;
        type = 'text/csv';
        break;
      case 'EXCEL':
        content = generateCSV(generatedReport);
        filename = `${reportType.toLowerCase()}_report_${new Date().toISOString().split('T')[0]}.csv`;
        type = 'text/csv';
        break;
      case 'PDF':
        alert('PDF export requires backend implementation. Please use CSV or JSON format.');
        return;
      default:
        return;
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = (data: any) => {
    if (!data || !data.data) {
      return '';
    }

    const headers = Object.keys(data.data[0] || {}).join(',');
    const rows = data.data.map((row: any) =>
      Object.values(row).map((value: any) =>
        typeof value === 'object' ? JSON.stringify(value).replace(/"/g, '""') : value
      ).join(',')
    );

    return [headers, ...rows].join('\n');
  };

  const handlePreview = () => {
    setOpenPreviewDialog(true);
  };

  const handleClosePreview = () => {
    setOpenPreviewDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Reports & Analytics</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleGenerateReport}
          disabled={isLoading}
        >
          Refresh Reports
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Report Type Selection */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Report Type</Typography>
              <TextField
                fullWidth
                select
                label="Select Report"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="POL_SUMMARY">POL Order Summary</MenuItem>
                <MenuItem value="FORMING_ANALYSIS">Forming Analysis</MenuItem>
                <MenuItem value="QC_ANALYSIS">QC Analysis</MenuItem>
                <MenuItem value="PRODUCTION_PROGRESS">Production Progress</MenuItem>
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        {/* Date Range */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Date Range</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="From Date"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  label="To Date"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Export Format */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Export Format</Typography>
              <TextField
                fullWidth
                select
                label="Format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <MenuItem value="JSON">JSON</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
                <MenuItem value="EXCEL">Excel</MenuItem>
                <MenuItem value="PDF">PDF</MenuItem>
              </TextField>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={handleGenerateReport}
          disabled={isLoading}
          size="large"
        >
          Generate Report
        </Button>
        {generatedReport && (
          <>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              variant="outlined"
              startIcon={<PrintIcon />}
              onClick={handlePreview}
            >
              Preview
            </Button>
          </>
        )}
      </Box>

      {/* Report Preview */}
      {generatedReport && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Report Preview</Typography>
              <Chip
                label={format}
                color="primary"
                size="small"
              />
            </Box>

            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                <Typography variant="body2" paragraph>
                  <strong>Report Type:</strong> {reportType}
                </Typography>

                <Typography variant="body2" paragraph>
                  <strong>Date Range:</strong> {fromDate || 'All Time'} - {toDate || 'Present'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {generatedReport.summary && (
                  <>
                    <Typography variant="h6" gutterBottom>Summary</Typography>
                    {Object.entries(generatedReport.summary).map(([key, value]) => (
                      <Box key={key} sx={{ mb: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>{key}:</strong> {String(value)}
                        </Typography>
                      </Box>
                    ))}
                  </>
                )}

                {generatedReport.data && generatedReport.data.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>Details</Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {Object.keys(generatedReport.data[0]).map((key) => (
                              <TableCell key={key}>{key}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {generatedReport.data.map((row: any, index: number) => (
                            <TableRow key={index}>
                              {Object.values(row).map((value: any, cellIndex: number) => (
                                <TableCell key={cellIndex}>
                                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Report Preview Dialog */}
      <Dialog open={openPreviewDialog} onClose={handleClosePreviewDialog} maxWidth="lg" fullWidth>
        <DialogTitle>Report Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
            {generatedReport && (
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(generatedReport, null, 2)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreviewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reports;
