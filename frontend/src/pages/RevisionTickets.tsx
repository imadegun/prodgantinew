import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  AlertTitle,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Send as SubmitIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { revisionService } from '../services/revision.service';
import { RevisionTicket } from '../types';

const RevisionTickets = (): JSX.Element => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [tickets, setTickets] = useState<RevisionTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<RevisionTicket | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Form
  const [formData, setFormData] = useState({
    polId: '',
    type: 'DESIGN',
    issueType: '',
    severity: 'MEDIUM',
    description: '',
    proposedSolution: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, typeFilter]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (typeFilter !== 'all') filters.type = typeFilter;
      
      const data = await revisionService.getAll(filters);
      setTickets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch revision tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      await revisionService.create({
        ...formData,
        polId: formData.polId || undefined,
        createdBy: user?.id,
      });
      setCreateDialogOpen(false);
      setFormData({
        polId: '',
        type: 'DESIGN',
        issueType: '',
        severity: 'MEDIUM',
        description: '',
        proposedSolution: '',
      });
      setSuccess('Revision ticket created successfully');
      fetchTickets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to create revision ticket');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (ticketId: string) => {
    try {
      await revisionService.submit(Number(ticketId));
      setSuccess('Ticket submitted for approval');
      fetchTickets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit ticket');
    }
  };

  const handleApprove = async (ticketId: string) => {
    try {
      await revisionService.approve(Number(ticketId));
      setSuccess('Ticket approved');
      fetchTickets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to approve ticket');
    }
  };

  const handleReject = async () => {
    if (!selectedTicket) return;
    try {
      await revisionService.reject(Number(selectedTicket.id), rejectReason);
      setRejectDialogOpen(false);
      setRejectReason('');
      setSelectedTicket(null);
      setSuccess('Ticket rejected');
      fetchTickets();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to reject ticket');
    }
  };

  const openRejectDialog = (ticket: RevisionTicket) => {
    setSelectedTicket(ticket);
    setRejectDialogOpen(true);
  };

  const handleView = (ticket: RevisionTicket) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'success';
      case 'PENDING_APPROVAL':
        return 'warning';
      case 'REJECTED':
        return 'error';
      case 'IMPLEMENTED':
        return 'info';
      case 'DRAFT':
        return 'default';
      default:
        return 'default';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'error';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'success';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DESIGN':
        return 'primary';
      case 'PRODUCTION':
        return 'secondary';
      case 'MATERIAL':
        return 'info';
      case 'OTHER':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.polId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.issueType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusSteps = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IMPLEMENTED'];

  if (loading && tickets.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>📋 Revision Tickets</Typography>
          <Skeleton variant="rectangular" width={150} height={40} />
        </Box>
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>📋 Revision Tickets</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchTickets}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateDialogOpen(true)}>
            New Ticket
          </Button>
        </Box>
      </Box>

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

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PENDING_APPROVAL">Pending Approval</MenuItem>
                  <MenuItem value="APPROVED">Approved</MenuItem>
                  <MenuItem value="REJECTED">Rejected</MenuItem>
                  <MenuItem value="IMPLEMENTED">Implemented</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="DESIGN">Design Change</MenuItem>
                  <MenuItem value="PRODUCTION">Production Change</MenuItem>
                  <MenuItem value="MATERIAL">Material Change</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        {loading && <Box sx={{ height: 4 }}><Box sx={{ bgcolor: 'primary.main', height: '100%' }} /></Box>}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Ticket #</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>POL/Product</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created By</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No revision tickets found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredTickets.map((ticket) => (
                <TableRow key={ticket?.id || Math.random()} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {ticket?.id ? `REV-${String(ticket.id).slice(-6)}` : 'REV-N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>{ticket?.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>{ticket?.polId || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={ticket?.type || 'N/A'}
                      color={getTypeColor(ticket?.type || '') as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket?.severity || 'N/A'}
                      color={getSeverityColor(ticket?.severity || '') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={ticket?.status?.replace('_', ' ') || 'N/A'}
                      color={getStatusColor(ticket?.status || '') as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{ticket?.createdBy || 'Unknown'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => handleView(ticket)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    {ticket.status === 'DRAFT' && (
                      <Tooltip title="Submit for Approval">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleSubmit(ticket.id)}
                        >
                          <SubmitIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {ticket.status === 'PENDING_APPROVAL' && user?.role === 'MANAGER' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleApprove(ticket.id)}
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => openRejectDialog(ticket)}
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Revision Ticket</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="POL ID (Optional)"
                value={formData.polId}
                onChange={(e) => setFormData({ ...formData, polId: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="DESIGN">Design Change</MenuItem>
                  <MenuItem value="PRODUCTION">Production Change</MenuItem>
                  <MenuItem value="MATERIAL">Material Change</MenuItem>
                  <MenuItem value="OTHER">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={formData.severity}
                  label="Severity"
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Issue Type"
                value={formData.issueType}
                onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
                placeholder="e.g., Color mismatch, Size adjustment, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe the issue in detail..."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Proposed Solution"
                value={formData.proposedSolution}
                onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
                placeholder="Describe your proposed solution..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={saving || !formData.description}>
            {saving ? 'Saving...' : 'Create Ticket'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedTicket && (
          <>
            <DialogTitle>Revision Ticket Details</DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Stepper activeStep={statusSteps.indexOf(selectedTicket.status || '')} alternativeLabel>
                  {statusSteps.map((step) => (
                    <Step key={step}>
                      <StepLabel>{step.replace('_', ' ')}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Ticket #</Typography>
                  <Typography>REV-{selectedTicket.id.slice(-6)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                  <Typography>{new Date(selectedTicket.createdAt).toLocaleDateString()}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">POL ID</Typography>
                  <Typography>{selectedTicket.polId || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                  <Chip label={selectedTicket.type} color={getTypeColor(selectedTicket.type) as any} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Severity</Typography>
                  <Chip label={selectedTicket.severity} color={getSeverityColor(selectedTicket.severity) as any} size="small" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Issue Type</Typography>
                  <Typography>{selectedTicket.issueType}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography>{selectedTicket.description}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">Proposed Solution</Typography>
                  <Typography>{selectedTicket.proposedSolution || 'None provided'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip label={selectedTicket.status?.replace('_', ' ')} color={getStatusColor(selectedTicket.status || '') as any} size="small" />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">Created By</Typography>
                  <Typography>{selectedTicket.createdBy || 'Unknown'}</Typography>
                </Grid>
                {selectedTicket.approvedBy && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Approved By</Typography>
                    <Typography>{selectedTicket.approvedBy}</Typography>
                  </Grid>
                )}
                {selectedTicket.approvedAt && (
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">Approved At</Typography>
                    <Typography>{new Date(selectedTicket.approvedAt).toLocaleString()}</Typography>
                  </Grid>
                )}
                {selectedTicket.managerNotes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">Manager Notes</Typography>
                    <Typography>{selectedTicket.managerNotes}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              {selectedTicket.status === 'DRAFT' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SubmitIcon />}
                  onClick={() => {
                    handleSubmit(selectedTicket.id);
                    setViewDialogOpen(false);
                  }}
                >
                  Submit for Approval
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Revision Ticket</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Reason for Rejection"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Please provide a reason for rejecting this ticket..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={!rejectReason.trim()}
          >
            Reject Ticket
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RevisionTickets;
