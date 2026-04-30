const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createProject,
  getUserProjects,
  getProjectById,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { createProjectValidators, validate } = require('../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/projects - Create a new project
router.post('/', createProjectValidators, validate, createProject);

// GET /api/projects - Get all projects for the user
router.get('/', getUserProjects);

// GET /api/projects/:projectId - Get project by ID
router.get('/:projectId', getProjectById);

// POST /api/projects/:projectId/members - Add member to project (Admin only)
router.post('/:projectId/members', addMember);

// DELETE /api/projects/:projectId/members/:memberId - Remove member from project (Admin only)
router.delete('/:projectId/members/:memberId', removeMember);

module.exports = router;
