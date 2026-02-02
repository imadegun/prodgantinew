import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Grid, Chip, LinearProgress, Button, Divider, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Edit as EditIcon } from '@mui/icons-material';

const POLDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/pols')}>
          Back to POLs
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600, flex: 1 }}>
          POL-{id} - Detail View
        </Typography>
        <Button variant="contained" startIcon={<EditIcon />}>
          Edit POL
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>POL Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">PO Number</Typography>
                  <Typography sx={{ fontWeight: 500 }}>PO-{id}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Client</Typography>
                  <Typography sx={{ fontWeight: 500 }}>ABC Corporation</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">PO Date</Typography>
                  <Typography sx={{ fontWeight: 500 }}>2026-01-15</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Delivery Date</Typography>
                  <Typography sx={{ fontWeight: 500 }}>2026-02-15</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography color="text.secondary">Status</Typography>
                  <Chip label="In Progress" color="success" size="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Production Progress</Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Forming</Typography>
                  <Typography>75%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={75} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Firing</Typography>
                  <Typography>50%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={50} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>Glazing</Typography>
                  <Typography>20%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={20} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography>QC</Typography>
                  <Typography>10%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={10} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Products</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Product Code</TableCell>
                    <TableCell>Product Name</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Material</TableCell>
                    <TableCell>Order Qty</TableCell>
                    <TableCell>Current Stage</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>TP-MAIN</TableCell>
                    <TableCell>Teapot (Main Body)</TableCell>
                    <TableCell>Blue</TableCell>
                    <TableCell>Stoneware</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell><Chip label="Trimming" size="small" color="success" /></TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>TP-LID</TableCell>
                    <TableCell>Teapot (Lid)</TableCell>
                    <TableCell>Blue</TableCell>
                    <TableCell>Stoneware</TableCell>
                    <TableCell>100</TableCell>
                    <TableCell><Chip label="Throwing" size="small" color="warning" /></TableCell>
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

export default POLDetail;
