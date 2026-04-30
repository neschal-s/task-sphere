const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

// Auth validators
const signupValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidators = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Project validators
const createProjectValidators = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
];

// Task validators
const createTaskValidators = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
];

const updateTaskValidators = [
  body('title').optional().trim(),
  body('status').optional().isIn(['To Do', 'In Progress', 'Done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
];

module.exports = {
  validate,
  signupValidators,
  loginValidators,
  createProjectValidators,
  createTaskValidators,
  updateTaskValidators,
};
