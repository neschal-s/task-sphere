const Task = require('../models/Task');
const Project = require('../models/Project');

// Create a new task
const createTask = async (req, res, next) => {
  try {
    const { title, description, dueDate, priority, projectId, assignedTo } = req.body;
    const userId = req.user.userId;

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    // Create task
    const task = new Task({
      title,
      description,
      dueDate,
      priority,
      projectId,
      assignedTo,
      createdBy: userId,
    });

    await task.save();
    await task.populate('assignedTo');
    await task.populate('createdBy');

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// Get tasks for a project
const getTasksByProject = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const userId = req.user.userId;

    if (!projectId) {
      return res.status(400).json({ error: 'projectId is required' });
    }

    // Check if project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get tasks
    const tasks = await Task.find({ projectId })
      .populate('assignedTo')
      .populate('createdBy');

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get tasks assigned to the user
const getMyTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const tasks = await Task.find({ assignedTo: userId })
      .populate('assignedTo')
      .populate('createdBy')
      .populate('projectId');

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// Update task
const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const userId = req.user.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user has permission to update task
    // Permission: if assigned to user OR if user created the task OR if user is project admin
    const project = await Project.findById(task.projectId);
    const isProjectAdmin = project.members.some(
      m => m.userId.toString() === userId && m.role === 'Admin'
    );
    const isAssignedToUser = task.assignedTo?.toString() === userId;
    const isTaskCreator = task.createdBy.toString() === userId;

    if (!isProjectAdmin && !isAssignedToUser && !isTaskCreator) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    await task.save();
    await task.populate('assignedTo');
    await task.populate('createdBy');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Delete task
const deleteTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is project admin
    const project = await Project.findById(task.projectId);
    const isProjectAdmin = project.members.some(
      m => m.userId.toString() === userId && m.role === 'Admin'
    );

    if (!isProjectAdmin) {
      return res.status(403).json({ error: 'Only project admins can delete tasks' });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTask,
  deleteTask,
};
