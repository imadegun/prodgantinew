import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

  // Get revision tickets
  router.get('/', authenticate, async (req, res) => {
    try {
      const { page = 1, limit = 10, status, type, polId } = req.query;
      
      // TODO: Implement revision tickets retrieval from database
      // Return mock data that matches frontend RevisionTicket interface
      const mockTickets = [
        {
          id: '1',
          polId: 'PO-2026-001',
          type: 'DESIGN',
          issueType: 'Color mismatch',
          severity: 'MEDIUM',
          description: 'The lid color does not match the teapot body color',
          proposedSolution: 'Adjust the glaze mixture to match the body color',
          status: 'APPROVED',
          createdBy: 'John Manager',
          approvedBy: 'Jane Admin',
          approvedAt: '2026-01-22T10:00:00Z',
          managerNotes: 'Approved - proceed with color adjustment',
          createdAt: '2026-01-20T10:00:00Z',
          updatedAt: '2026-01-22T10:00:00Z',
        },
        {
          id: '2',
          polId: 'PO-2026-002',
          type: 'PRODUCTION',
          issueType: 'Size adjustment needed',
          severity: 'HIGH',
          description: 'The teapot spout is too short, affecting pouring functionality',
          proposedSolution: 'Increase spout length by 2cm in the mold',
          status: 'PENDING_APPROVAL',
          createdBy: 'Mike Worker',
          createdAt: '2026-01-25T14:30:00Z',
          updatedAt: '2026-01-25T14:30:00Z',
        },
        {
          id: '3',
          polId: 'PO-2026-003',
          type: 'MATERIAL',
          issueType: 'Material quality issue',
          severity: 'HIGH',
          description: 'Clay quality is inconsistent, causing cracks during firing',
          proposedSolution: 'Switch to premium clay supplier and adjust firing temperature',
          status: 'DRAFT',
          createdBy: 'Sarah Manager',
          createdAt: '2026-01-28T09:15:00Z',
          updatedAt: '2026-01-28T09:15:00Z',
        },
        {
          id: '4',
          polId: 'PO-2026-001',
          type: 'OTHER',
          issueType: 'Packaging concern',
          severity: 'LOW',
          description: 'Current packaging may not protect products during long-distance shipping',
          proposedSolution: 'Add bubble wrap and reinforce corners of boxes',
          status: 'REJECTED',
          createdBy: 'John Manager',
          approvedBy: 'Jane Admin',
          approvedAt: '2026-01-24T16:00:00Z',
          managerNotes: 'Current packaging is sufficient. Rejecting this change.',
          createdAt: '2026-01-23T11:00:00Z',
          updatedAt: '2026-01-24T16:00:00Z',
        },
        {
          id: '5',
          polId: 'PO-2026-004',
          type: 'DESIGN',
          issueType: 'Handle comfort',
          severity: 'MEDIUM',
          description: 'Customer feedback indicates handle is uncomfortable to grip',
          proposedSolution: 'Redesign handle with ergonomic curve and textured grip',
          status: 'IMPLEMENTED',
          createdBy: 'Mike Worker',
          approvedBy: 'John Manager',
          approvedAt: '2026-01-26T10:00:00Z',
          managerNotes: 'Approved - implement in next production run',
          createdAt: '2026-01-24T13:00:00Z',
          updatedAt: '2026-01-27T10:00:00Z',
        },
      ];
      
      // Apply filters
      let filteredTickets = mockTickets;
      if (status && status !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.status === status);
      }
      if (type && type !== 'all') {
        filteredTickets = filteredTickets.filter(t => t.type === type);
      }
      if (polId) {
        filteredTickets = filteredTickets.filter(t => t.polId === polId);
      }
      
      res.json({
        success: true,
        data: {
          tickets: filteredTickets,
        },
        meta: {
          page: Number(page),
          limit: Number(limit),
          total: filteredTickets.length,
          totalPages: Math.ceil(filteredTickets.length / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_REVISIONS_FAILED',
          message: 'Failed to fetch revision tickets',
        },
      });
    }
  });

// Create revision ticket
router.post('/', authenticate, async (req, res) => {
  try {
    const { polId, type, issueType, severity, description, proposedSolution, createdBy } = req.body;
    
    // TODO: Implement revision ticket creation in database
    // Return mock response
    const newTicket = {
      id: String(Date.now()),
      polId: polId || null,
      type: type || 'OTHER',
      issueType: issueType || '',
      severity: severity || 'MEDIUM',
      description: description || '',
      proposedSolution: proposedSolution || '',
      status: 'DRAFT',
      createdBy: createdBy || 'Unknown',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    res.status(201).json({
      success: true,
      data: newTicket,
      message: 'Revision ticket created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_REVISION_FAILED',
        message: 'Failed to create revision ticket',
      },
    });
  }
});

// Submit revision for approval
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement revision submission in database
    // Return mock response with PENDING_APPROVAL status
    res.json({
      success: true,
      data: {
        id: id,
        status: 'PENDING_APPROVAL',
        submittedAt: new Date().toISOString(),
      },
      message: 'Revision ticket submitted for approval',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'SUBMIT_REVISION_FAILED',
        message: 'Failed to submit revision ticket',
      },
    });
  }
});

// Approve revision
router.post('/:id/approve', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: Implement revision approval in database
    res.json({
      success: true,
      data: {
        id: id,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
      },
      message: 'Revision ticket approved',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'APPROVE_REVISION_FAILED',
        message: 'Failed to approve revision ticket',
      },
    });
  }
});

// Reject revision
router.post('/:id/reject', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // TODO: Implement revision rejection in database
    res.json({
      success: true,
      data: {
        id: id,
        status: 'REJECTED',
        approvedAt: new Date().toISOString(),
        managerNotes: reason,
      },
      message: 'Revision ticket rejected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'REJECT_REVISION_FAILED',
        message: 'Failed to reject revision ticket',
      },
    });
  }
});

export default router;
