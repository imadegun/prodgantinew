import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Typography, Card, CardContent, Grid, TextField, Button, Switch, FormControlLabel, Divider, Avatar, Alert, AlertTitle, CircularProgress, Tab, Tabs, IconButton } from '@mui/material';
import { Save as SaveIcon, PhotoCamera as PhotoCameraIcon } from '@mui/icons-material';
import { RootState } from '../store';
import { updateProfile } from '../store/authSlice';
import { authService } from '../services/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box hidden={value !== index} sx={{ py: 3 }}>
    {value === index && children}
  </Box>
);

const Settings = (): JSX.Element => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.username || '',
    username: user?.username || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notifications, setNotifications] = useState({
    criticalAlerts: true,
    warningAlerts: true,
    infoAlerts: false,
    browserNotifications: true,
    dailySummary: true,
    weeklyReports: true,
    emailNotifications: true,
  });

  const [systemSettings, setSystemSettings] = useState({
    autoSave: true,
    showDiscrepancyWarnings: true,
    darkMode: false,
    compactView: false,
  });

  const handleProfileSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await authService.updateProfile(profileData);
      dispatch(updateProfile(updated));
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications({ ...notifications, [key]: event.target.checked });
    localStorage.setItem(`notification_${key}`, event.target.checked ? 'true' : 'false');
  };

  const handleSystemChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSystemSettings({ ...systemSettings, [key]: event.target.checked });
    localStorage.setItem(`system_${key}`, event.target.checked ? 'true' : 'false');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Settings
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

      <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="Profile" />
        <Tab label="Security" />
        <Tab label="Notifications" />
        <Tab label="System" />
      </Tabs>

      <TabPanel value={activeTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    sx={{
                      width: 100,
                      height: 100,
                      mx: 'auto',
                      mb: 2,
                      bgcolor: 'primary.main',
                      fontSize: '2rem',
                    }}
                  >
                    {user?.fullName?.charAt(0) || 'U'}
                  </Avatar>
                  <IconButton
                    sx={{
                      position: 'absolute',
                      bottom: 16,
                      right: 0,
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'grey.100' },
                    }}
                    size="small"
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                </Box>
                <Typography variant="h6">{user?.fullName || 'User'}</Typography>
                <Typography color="text.secondary" gutterBottom>
                  {user?.role || 'Unknown'}
                </Typography>
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
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={profileData.fullName}
                      onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={profileData.username}
                      disabled
                      helperText="Username cannot be changed"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={user?.role || 'Unknown'}
                      disabled
                      helperText="Role is assigned by administrator"
                    />
                  </Grid>
                </Grid>
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleProfileSave}
                  disabled={loading}
                  sx={{ mt: 3 }}
                >
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Card sx={{ maxWidth: 600 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Change Password</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  helperText="Password must be at least 6 characters"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </Grid>
            </Grid>
            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={handlePasswordChange}
              disabled={loading || !passwordData.currentPassword || !passwordData.newPassword}
              sx={{ mt: 3 }}
            >
              Change Password
            </Button>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>Notification Preferences</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Email Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.criticalAlerts}
                  onChange={handleNotificationChange('criticalAlerts')}
                />
              }
              label="Email notifications for critical alerts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.warningAlerts}
                  onChange={handleNotificationChange('warningAlerts')}
                />
              }
              label="Email notifications for warnings"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.infoAlerts}
                  onChange={handleNotificationChange('infoAlerts')}
                />
              }
              label="Email notifications for info alerts"
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Reports
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.dailySummary}
                  onChange={handleNotificationChange('dailySummary')}
                />
              }
              label="Daily production summary"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.weeklyReports}
                  onChange={handleNotificationChange('weeklyReports')}
                />
              }
              label="Weekly reports"
            />
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Browser Notifications
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={notifications.browserNotifications}
                  onChange={handleNotificationChange('browserNotifications')}
                />
              }
              label="Enable browser notifications"
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>System Settings</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.autoSave}
                  onChange={handleSystemChange('autoSave')}
                />
              }
              label="Auto-save data entry (every 30 seconds)"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              Automatically save your work to prevent data loss
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.showDiscrepancyWarnings}
                  onChange={handleSystemChange('showDiscrepancyWarnings')}
                />
              }
              label="Show quantity discrepancy warnings"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              Highlight when actual quantities differ significantly from expected
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.compactView}
                  onChange={handleSystemChange('compactView')}
                />
              }
              label="Compact table view"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4, mb: 2 }}>
              Show more data per page in tables
            </Typography>
            <Divider sx={{ my: 2 }} />
            <FormControlLabel
              control={
                <Switch
                  checked={systemSettings.darkMode}
                  onChange={handleSystemChange('darkMode')}
                  disabled
                />
              }
              label="Dark mode (coming soon)"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Dark mode is currently under development
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

export default Settings;
