import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Chip, List, ListItem, ListItemText, ListItemIcon, Button, FormControl, InputLabel, Select, MenuItem, Divider } from '@mui/material';
import { Warning as WarningIcon, Error as ErrorIcon, Info as InfoIcon, CheckCircle as AcknowledgeIcon, CheckCircle as ResolveIcon, Visibility as ViewIcon } from '@mui/icons-material';

const AlertCenter: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        🔔 Alert Center
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ErrorIcon sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>2</Typography>
                  <Typography variant="body2">Critical Alerts</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <WarningIcon sx={{ fontSize: 40, color: 'warning.dark' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.dark' }}>5</Typography>
                  <Typography variant="body2" sx={{ color: 'warning.dark' }}>Warnings</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InfoIcon sx={{ fontSize: 40, color: 'info.dark' }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.dark' }}>8</Typography>
                  <Typography variant="body2" sx={{ color: 'info.dark' }}>Informational</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Active Alerts</Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select label="Priority">
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <List>
            <ListItem sx={{ bgcolor: 'error.50', borderRadius: 2, mb: 1 }}>
              <ListItemIcon><ErrorIcon color="error" /></ListItemIcon>
              <ListItemText
                primary="Quantity Discrepancy Detected"
                secondary="PO-2026-045 - Trimming (55) exceeds Throwing (50)"
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<ViewIcon />}>View</Button>
                <Button size="small" color="success" startIcon={<AcknowledgeIcon />}>Acknowledge</Button>
              </Box>
            </ListItem>

            <ListItem sx={{ bgcolor: 'warning.50', borderRadius: 2, mb: 1 }}>
              <ListItemIcon><WarningIcon color="warning" /></ListItemIcon>
              <ListItemText
                primary="Delivery at Risk"
                secondary="PO-2026-042 - Estimated completion Feb 20, Delivery Feb 18"
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<ViewIcon />}>View</Button>
                <Button size="small" color="success" startIcon={<AcknowledgeIcon />}>Acknowledge</Button>
              </Box>
            </ListItem>

            <ListItem sx={{ bgcolor: 'info.50', borderRadius: 2 }}>
              <ListItemIcon><InfoIcon color="info" /></ListItemIcon>
              <ListItemText
                primary="Remake 2 Started"
                secondary="PO-2026-041 - Low firing temperature"
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<ViewIcon />}>View</Button>
                <Button size="small" color="success" startIcon={<AcknowledgeIcon />}>Acknowledge</Button>
              </Box>
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AlertCenter;
