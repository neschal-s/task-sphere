const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { createTaskValidators, updateTaskValidators, validate } = require('../utils/validators');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/tasks - Create a new task
router.post('/', createTaskValidators, validate, createTask);

// GET /api/tasks/project - Get tasks by project
router.get('/project', getTasksByProject);

// GET /api/tasks/my-tasks - Get tasks assigned to the user
router.get('/my-tasks', getMyTasks);

// PUT /api/tasks/:taskId - Update a task
router.put('/:taskId', updateTaskValidators, validate, updateTask);

// DELETE /api/tasks/:taskId - Delete a task
router.delete('/:taskId', deleteTask);

module.exports = router;
