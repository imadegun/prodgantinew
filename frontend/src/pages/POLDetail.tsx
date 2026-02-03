import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress, Button, Divider, Table, TableBody, TableCell, TableHead, TableRow, Alert, Skeleton, Tabs, Tab } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon, CheckCircle as CheckCircleIcon, Warning as WarningIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { fetchPOLDetailSuccess } from '../store/polSlice';
import { polService } from '../services/api';
import { POL, POLDetail as POLDetailType } from '../types';

const POLDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentPOL, polDetails, loading, error } = useSelector((state: RootState) => state.pol);
  const [activeTab, setActiveTab] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLocalLoading(true);
        try {
          const polData = await polService.getById(Number(id));
          dispatch(fetchPOLDetailSuccess(polData));
        } catch (err) {
          console.error('Failed to fetch POL details:', err);
        } finally {
          setLocalLoading(false);
        }
      }
    };
    fetchData();
  }, [id, dispatch]);

  const getStatusColor = (status: string): 'success' | 'info' | 'error' | 'default' => {
    switch (status) {
      case 'IN_PROGRESS': return 'success';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'error';
      case 'DRAFT': return 'default';
      default: return 'default';
    }
  };

  const getStageProgress = (stage: string): number => {
    const stages = ['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'];
    const index = stages.indexOf(stage);
    return index >= 0 ? ((index + 1) / stages.length) * 100 : 0;
  };

  if (localLoading || loading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Skeleton variant="rectangular" width={100} height={40} />
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="rectangular" width={120} height={40} sx={{ ml: 'auto' }} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={300} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (error || !currentPOL) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'POL not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pols')}>
          Back to POLs
        </Button>
      </Box>
    );
  }

  const details = polDetails.length > 0 ? polDetails : (currentPOL.details || []);

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pols')}>
          Back to POLs
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
          {currentPOL.po_number || `POL-${currentPOL.id}`} - Detail View
        </Typography>
        <Button variant="contained" startIcon={<EditIcon />}>
          Edit POL
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* POL Information Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>POL Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">PO Number</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{currentPOL.po_number || `PO-${currentPOL.id}`}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Client</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{currentPOL.client_name || currentPOL.customerName || '-'}</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">PO Date</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {currentPOL.createdAt || currentPOL.created_at ? new Date(currentPOL.createdAt || currentPOL.created_at || '').toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Delivery Date</Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {currentPOL.delivery_date || currentPOL.deliveryDate ? new Date(currentPOL.delivery_date || currentPOL.deliveryDate || '').toLocaleDateString() : 'N/A'}
                  </Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography color="text.secondary">Status</Typography>
                  <Chip
                    label={currentPOL.status || 'Unknown'}
                    color={getStatusColor(currentPOL.status || '') as any}
                    size="small"
                  />
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Total Order</Typography>
                  <Typography sx={{ fontWeight: 500 }}>{currentPOL.total_order || details.reduce((sum: number, d) => sum + (d.quantity || 0), 0)}</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Production Progress Card */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Production Progress</Typography>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                <Tab label="Overview" />
                <Tab label="Forming" />
                <Tab label="Firing" />
                <Tab label="Glazing" />
                <Tab label="QC" />
              </Tabs>
              
              {activeTab === 0 && (
                <Box>
                  {['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'].map((stage) => (
                    <Box key={stage} sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography>{stage.replace('_', ' ')}</Typography>
                        <Typography>{getStageProgress(stage)}%</Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={getStageProgress(stage)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  ))}
                </Box>
              )}

              {activeTab > 0 && (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">{['Forming', 'Firing', 'Glazing', 'Quality Control'][activeTab - 1]} stage details</Typography>
                  <LinearProgress variant="determinate" value={getStageProgress(['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL'][activeTab - 1])} sx={{ mt: 2, height: 10, borderRadius: 5 }} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Products Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Products</Typography>
              {details.length === 0 ? (
                <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No products added yet
                </Typography>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Code</TableCell>
                      <TableCell>Product Name</TableCell>
                      <TableCell>Color</TableCell>
                      <TableCell>Material</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell>Order Qty</TableCell>
                      <TableCell>Current Stage</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {details.map((detail: POLDetailType) => (
                      <TableRow key={detail.id}>
                        <TableCell>{detail.productCode || '-'}</TableCell>
                        <TableCell>{detail.productName || '-'}</TableCell>
                        <TableCell>{detail.color || '-'}</TableCell>
                        <TableCell>{detail.material || '-'}</TableCell>
                        <TableCell>{detail.size || '-'}</TableCell>
                        <TableCell>{detail.quantity || 0}</TableCell>
                        <TableCell>
                          <Chip
                            label={detail.notes?.split(' ')[0] || 'Forming'}
                            size="small"
                            color="success"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="On Track"
                            size="small"
                            color="success"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Alerts Section */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WarningIcon color="warning" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Alerts</Typography>
              </Box>
              <Typography color="text.secondary">
                No active alerts for this POL
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default POLDetail;
