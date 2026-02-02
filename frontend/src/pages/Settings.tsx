import React from 'react';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Switch, FormControlLabel, Divider, Avatar } from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

const Settings: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        ⚙️ Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                JM
              </Avatar>
              <Typography variant="h6">John Manager</Typography>
              <Typography color="text.secondary" gutterBottom>Manager</Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                Change Avatar
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Profile Settings</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Full Name" defaultValue="John Manager" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Email" defaultValue="john@company.com" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth label="Username" defaultValue="manager" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="password" label="Current Password" />
                </Grid>
              </Grid>
              <Button variant="contained" startIcon={<SaveIcon />} sx={{ mt: 3 }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>Notification Preferences</Typography>
              <FormControlLabel control={<Switch defaultChecked />} label="Email notifications for critical alerts" />
              <FormControlLabel control={<Switch defaultChecked />} label="Email notifications for warnings" />
              <FormControlLabel control={<Switch />} label="Email notifications for info alerts" />
              <FormControlLabel control={<Switch defaultChecked />} label="Browser notifications" />
              <Divider sx={{ my: 2 }} />
              <FormControlLabel control={<Switch defaultChecked />} label="Daily production summary" />
              <FormControlLabel control={<Switch defaultChecked />} label="Weekly reports" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>System Settings</Typography>
              <FormControlLabel control={<Switch defaultChecked />} label="Auto-save data entry (every 30 seconds)" />
              <FormControlLabel control={<Switch defaultChecked />} label="Show quantity discrepancy warnings" />
              <FormControlLabel control={<Switch />} label="Dark mode (coming soon)" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
