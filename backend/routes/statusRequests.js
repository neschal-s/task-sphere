const express = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const {
  requestStatusChange,
  getPendingRequests,
  approveStatusChange,
  rejectStatusChange,
  getTaskRequestHistory
} = require('../controllers/statusRequestController');

const router = express.Router();

// Request status change (any member)
router.post(
  '/',
  authMiddleware,
  [
    body('taskId').notEmpty().withMessage('Task ID is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
    body('requestedStatus').isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status'),
    body('reason').optional().isLength({ max: 500 }).withMessage('Reason must be less than 500 characters')
  ],
  requestStatusChange
);

// Get pending requests for a project (admin only)
router.get('/pending/:projectId', authMiddleware, getPendingRequests);

// Approve status change (admin only)
router.patch(
  '/:requestId/approve',
  authMiddleware,
  [
    body('approvalReason').optional().isLength({ max: 500 }).withMessage('Approval reason must be less than 500 characters')
  ],
  approveStatusChange
);

// Reject status change (admin only)
router.patch(
  '/:requestId/reject',
  authMiddleware,
  [
    body('rejectionReason').optional().isLength({ max: 500 }).withMessage('Rejection reason must be less than 500 characters')
  ],
  rejectStatusChange
);

// Get request history for a task
router.get('/task/:taskId', authMiddleware, getTaskRequestHistory);

module.exports = router;
