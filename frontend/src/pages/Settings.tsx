import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Pagination,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAppSelector } from '../hooks/useAppSelector';
import { userService } from '../services/user.service';
import { productionService } from '../services/production.service';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings = (): JSX.Element => {
  const { user } = useAppSelector((state) => state.auth);
  
  const [tabValue, setTabValue] = useState(0);
  
  // Profile state
  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // User management state
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersMeta, setUsersMeta] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'WORKER',
    isActive: true,
  });
  
  // Defect reasons state
  const [defectReasons, setDefectReasons] = useState<any[]>([]);
  const [defectReasonsLoading, setDefectReasonsLoading] = useState(false);
  const [defectDialogOpen, setDefectDialogOpen] = useState(false);
  const [editingDefect, setEditingDefect] = useState<any>(null);
  const [defectForm, setDefectForm] = useState({
    category: '',
    description: '',
    isActive: true,
  });
  
  // System settings
  const [systemSettings, setSystemSettings] = useState({
    autoSave: true,
    showDiscrepancyWarnings: true,
    compactView: false,
    darkMode: false,
  });
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Load initial data
  useEffect(() => {
    // Load system settings from localStorage
    const autoSave = localStorage.getItem('system_autoSave');
    const showWarnings = localStorage.getItem('system_showDiscrepancyWarnings');
    const compactView = localStorage.getItem('system_compactView');
    const darkMode = localStorage.getItem('system_darkMode');
    
    setSystemSettings({
      autoSave: autoSave !== 'false',
      showDiscrepancyWarnings: showWarnings !== 'false',
      compactView: compactView === 'true',
      darkMode: darkMode === 'true',
    });
  }, []);

  // Load users when tab changes to User Management
  useEffect(() => {
    if (tabValue === 1) {
      loadUsers();
    }
  }, [tabValue]);

  // Load defect reasons when tab changes to Defect Reasons
  useEffect(() => {
    if (tabValue === 2) {
      loadDefectReasons();
    }
  }, [tabValue]);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await userService.getUsers({ page: usersMeta.page, limit: usersMeta.limit });
      setUsers(response.data);
      setUsersMeta(response.meta);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      showSnackbar(error.response?.data?.error?.message || 'Failed to load users - You may not have permission', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const loadDefectReasons = async () => {
    setDefectReasonsLoading(true);
    try {
      const response = await productionService.getAllDefectReasons();
      setDefectReasons(response);
    } catch (error) {
      showSnackbar('Failed to load defect reasons', 'error');
    } finally {
      setDefectReasonsLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // User Management handlers
  const handleOpenUserDialog = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserForm({
        username: user.username,
        email: user.email || '',
        password: '',
        fullName: user.fullName || '',
        role: user.role,
        isActive: user.isActive,
      });
    } else {
      setEditingUser(null);
      setUserForm({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: 'WORKER',
        isActive: true,
      });
    }
    setUserDialogOpen(true);
  };

  const handleCloseUserDialog = () => {
    setUserDialogOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          email: userForm.email,
          fullName: userForm.fullName,
          role: userForm.role,
          isActive: userForm.isActive,
        });
        showSnackbar('User updated successfully', 'success');
      } else {
        await userService.createUser({
          username: userForm.username,
          email: userForm.email,
          password: userForm.password,
          fullName: userForm.fullName,
          role: userForm.role,
        });
        showSnackbar('User created successfully', 'success');
      }
      handleCloseUserDialog();
      loadUsers();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error?.message || 'Failed to save user', 'error');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Are you sure you want to deactivate this user?')) {
      try {
        await userService.deleteUser(userId);
        showSnackbar('User deactivated successfully', 'success');
        loadUsers();
      } catch (error) {
        showSnackbar('Failed to deactivate user', 'error');
      }
    }
  };

  // Defect Reasons handlers
  const handleOpenDefectDialog = (defect?: any) => {
    if (defect) {
      setEditingDefect(defect);
      setDefectForm({
        category: defect.category,
        description: defect.description,
        isActive: defect.isActive,
      });
    } else {
      setEditingDefect(null);
      setDefectForm({
        category: '',
        description: '',
        isActive: true,
      });
    }
    setDefectDialogOpen(true);
  };

  const handleCloseDefectDialog = () => {
    setDefectDialogOpen(false);
    setEditingDefect(null);
  };

  const handleSaveDefect = async () => {
    try {
      if (editingDefect) {
        await productionService.updateDefectReason(editingDefect.id, {
          category: defectForm.category,
          description: defectForm.description,
          isActive: defectForm.isActive,
        });
        showSnackbar('Defect reason updated successfully', 'success');
      } else {
        await productionService.createDefectReason({
          category: defectForm.category,
          description: defectForm.description,
        });
        showSnackbar('Defect reason created successfully', 'success');
      }
      handleCloseDefectDialog();
      loadDefectReasons();
    } catch (error: any) {
      showSnackbar(error.response?.data?.error?.message || 'Failed to save defect reason', 'error');
    }
  };

  const handleDeleteDefect = async (defectId: number) => {
    if (confirm('Are you sure you want to deactivate this defect reason?')) {
      try {
        await productionService.deleteDefectReason(defectId);
        showSnackbar('Defect reason deactivated successfully', 'success');
        loadDefectReasons();
      } catch (error) {
        showSnackbar('Failed to deactivate defect reason', 'error');
      }
    }
  };

  // System settings handlers
  const handleSystemChange = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.checked;
    setSystemSettings({ ...systemSettings, [key]: value });
    localStorage.setItem(`system_${key}`, value ? 'true' : 'false');
  };

  // Tab change handler
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showSnackbar('Profile updated successfully', 'success');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar('Passwords do not match', 'error');
      return;
    }
    showSnackbar('Password changed successfully', 'success');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 3 }}>
        Settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Profile" />
          <Tab label="User Management" />
          <Tab label="Defect Reasons" />
          <Tab label="System Settings" />
        </Tabs>
      </Box>

      {/* Profile Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Profile Information</Typography>
                <form onSubmit={handleProfileSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={profileForm.username}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        value={profileForm.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained">
                        Save Profile
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>Change Password</Typography>
                <form onSubmit={handlePasswordSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" variant="contained">
                        Change Password
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* User Management Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">User Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenUserDialog()}
              >
                Add User
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Full Name</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                  {usersLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">No users found</TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} hover>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.fullName || '-'}</TableCell>
                        <TableCell>{user.email || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={user.role} 
                            size="small" 
                            color={user.role === 'MANAGER' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={user.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={user.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenUserDialog(user)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteUser(user.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {usersMeta.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination
                  count={usersMeta.totalPages}
                  page={usersMeta.page}
                  onChange={(_, page) => {
                    setUsersMeta({ ...usersMeta, page });
                    loadUsers();
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* User Dialog */}
        <Dialog open={userDialogOpen} onClose={handleCloseUserDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={userForm.username}
                  onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                  disabled={!!editingUser}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                />
              </Grid>
              {!editingUser && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    required={!editingUser}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={userForm.role}
                    label="Role"
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <MenuItem value="MANAGER">Manager</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                    <MenuItem value="WORKER">Worker</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={userForm.isActive}
                      onChange={(e) => setUserForm({ ...userForm, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUserDialog}>Cancel</Button>
            <Button onClick={handleSaveUser} variant="contained">
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      {/* Defect Reasons Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Defect Reasons Management</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDefectDialog()}
              >
                Add Defect Reason
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                  {defectReasonsLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Loading...</TableCell>
                    </TableRow>
                  ) : defectReasons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">No defect reasons found</TableCell>
                    </TableRow>
                  ) : (
                    defectReasons.map((defect) => (
                      <TableRow key={defect.id} hover>
                        <TableCell>{defect.category}</TableCell>
                        <TableCell>{defect.description}</TableCell>
                        <TableCell>
                          <Chip 
                            label={defect.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={defect.isActive ? 'success' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenDefectDialog(defect)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteDefect(defect.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Defect Reason Dialog */}
        <Dialog open={defectDialogOpen} onClose={handleCloseDefectDialog} maxWidth="sm" fullWidth>
          <DialogTitle>{editingDefect ? 'Edit Defect Reason' : 'Add New Defect Reason'}</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category"
                  value={defectForm.category}
                  onChange={(e) => setDefectForm({ ...defectForm, category: e.target.value })}
                  required
                  placeholder="e.g., Defect, Break, Glaze Color, Crack, Warping"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={defectForm.description}
                  onChange={(e) => setDefectForm({ ...defectForm, description: e.target.value })}
                  required
                  multiline
                  rows={2}
                />
              </Grid>
              {editingDefect && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={defectForm.isActive}
                        onChange={(e) => setDefectForm({ ...defectForm, isActive: e.target.checked })}
                      />
                    }
                    label="Active"
                  />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDefectDialog}>Cancel</Button>
            <Button onClick={handleSaveDefect} variant="contained">
              {editingDefect ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </TabPanel>

      {/* System Settings Tab */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 3 }}>System Settings</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.autoSave}
                      onChange={handleSystemChange('autoSave')}
                    />
                  }
                  label="Auto-save form data"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
                  Automatically save form data to local storage
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.showDiscrepancyWarnings}
                      onChange={handleSystemChange('showDiscrepancyWarnings')}
                    />
                  }
                  label="Show discrepancy warnings"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
                  Show warnings when quantity discrepancies are detected
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.compactView}
                      onChange={handleSystemChange('compactView')}
                    />
                  }
                  label="Compact view"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
                  Use compact table layout
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={systemSettings.darkMode}
                      onChange={handleSystemChange('darkMode')}
                    />
                  }
                  label="Dark mode"
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 6 }}>
                  Enable dark theme
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
