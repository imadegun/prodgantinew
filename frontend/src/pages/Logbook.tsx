import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';

const Logbook: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          📝 Logbook
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          New Entry
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
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select label="Severity">
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
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
              <TableCell>Entry ID</TableCell>
              <TableCell>Date/Time</TableCell>
              <TableCell>POL/Product</TableCell>
              <TableCell>Issue Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>LB-001</TableCell>
              <TableCell>Jan 31, 2PM</TableCell>
              <TableCell>PO-2026-045 - Teapot</TableCell>
              <TableCell>Process Issue</TableCell>
              <TableCell><Chip label="High" color="error" size="small" /></TableCell>
              <TableCell><Chip label="Open" size="small" /></TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>LB-002</TableCell>
              <TableCell>Jan 30, 11AM</TableCell>
              <TableCell>PO-2026-042 - Cup</TableCell>
              <TableCell>Quality Issue</TableCell>
              <TableCell><Chip label="Medium" color="warning" size="small" /></TableCell>
              <TableCell><Chip label="In Progress" color="warning" size="small" /></TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
            <TableRow>
              <TableCell>LB-003</TableCell>
              <TableCell>Jan 29, 4PM</TableCell>
              <TableCell>PO-2026-040 - Cup</TableCell>
              <TableCell>Material Issue</TableCell>
              <TableCell><Chip label="Low" color="success" size="small" /></TableCell>
              <TableCell><Chip label="Resolved" color="success" size="small" /></TableCell>
              <TableCell><Button size="small">View</Button></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </Box>
  );
};

export default Logbook;
