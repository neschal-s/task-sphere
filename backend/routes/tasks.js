const express = require('express');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTask,
  deleteTask,
  requestStatusChange,
  approveStatusChange,
} = require('../controllers/taskController');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
};

// All routes require authentication
router.use(authMiddleware);

// POST /api/tasks - Create a new task
router.post('/',
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  validate,
  createTask
);

// GET /api/tasks/my-tasks - Get tasks assigned to the user (must be before /:taskId route)
router.get('/my-tasks', getMyTasks);

// GET /api/tasks/project - Get tasks by project
router.get('/project', getTasksByProject);

// POST /api/tasks/:taskId/request-status-change - Request status change (members)
router.post('/:taskId/request-status-change',
  body('newStatus').isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status'),
  validate,
  requestStatusChange
);

// PATCH /api/tasks/:taskId/approve-status-change - Approve status change (admin)
router.patch('/:taskId/approve-status-change',
  body('approve').isBoolean().withMessage('Approve field must be boolean'),
  validate,
  approveStatusChange
);

// PUT /api/tasks/:taskId - Update a task
router.put('/:taskId',
  body('title').optional().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  validate,
  updateTask
);

// DELETE /api/tasks/:taskId - Delete a task
router.delete('/:taskId', deleteTask);

module.exports = router;
