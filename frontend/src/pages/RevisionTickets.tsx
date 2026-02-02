import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

const RevisionTickets: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          📋 Revision Tickets
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Ticket
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select label="Status">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                  <MenuItem value="implemented">Implemented</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select label="Type">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="design">Design Change</MenuItem>
                  <MenuItem value="material">Material Change</MenuItem>
                  <MenuItem value="process">Process Change</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField fullWidth size="small" placeholder="Search..." InputProps={{ startAdornment: <SearchIcon /> }} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>POL/Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>REV-001</TableCell>
              <TableCell>Jan 30</TableCell>
              <TableCell>PO-2026-045 - Teapot Lid</TableCell>
              <TableCell>Design Change</TableCell>
              <TableCell><Chip label="Approved" color="success" size="small" /></TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>REV-002</TableCell>
              <TableCell>Jan 29</TableCell>
              <TableCell>PO-2026-042 - Cup</TableCell>
              <TableCell>Material Change</TableCell>
              <TableCell><Chip label="Pending Approval" color="warning" size="small" /></TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>REV-003</TableCell>
              <TableCell>Jan 28</TableCell>
              <TableCell>PO-2026-040 - Bowl</TableCell>
              <TableCell>Process Change</TableCell>
              <TableCell><Chip label="Draft" size="small" /></TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default RevisionTickets;
