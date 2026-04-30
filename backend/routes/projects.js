const express = require('express');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const {
  createProject,
  getUserProjects,
  getProjectById,
  addMember,
  removeMember,
} = require('../controllers/projectController');

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

// POST /api/projects - Create a new project
router.post('/',
  body('name').trim().notEmpty().withMessage('Project name is required'),
  body('description').optional().trim(),
  validate,
  createProject
);

// GET /api/projects - Get all projects for the user
router.get('/', getUserProjects);

// GET /api/projects/:projectId - Get project by ID
router.get('/:projectId', getProjectById);

// POST /api/projects/:projectId/members - Add member to project (Admin only)
router.post('/:projectId/members', addMember);

// DELETE /api/projects/:projectId/members/:memberId - Remove member from project (Admin only)
router.delete('/:projectId/members/:memberId', removeMember);

module.exports = router;
