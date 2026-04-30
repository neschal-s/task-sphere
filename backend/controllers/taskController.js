const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

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

    // Create notifications for all project members (except creator)
    const projectMembers = project.members.map(m => m.userId.toString());
    for (const memberId of projectMembers) {
      if (memberId !== userId) {
        const notification = new Notification({
          userId: memberId,
          type: 'new_task',
          projectId: projectId,
          taskId: task._id,
          message: `New task "${task.title}" added to project "${project.name}"`
        });
        await notification.save();
      }
    }

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

// Update task (Admin only for direct status changes, members must request)
const updateTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { title, description, status, priority, dueDate, assignedTo } = req.body;
    const userId = req.user.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const project = await Project.findById(task.projectId);
    const isProjectAdmin = project.members.some(
      m => m.userId.toString() === userId && m.role === 'Admin'
    );

    // Only admin can update tasks directly
    if (!isProjectAdmin) {
      return res.status(403).json({ error: 'Only project admins can update tasks' });
    }

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    // Clear pending status change if any
    task.pendingStatusChange = undefined;

    await task.save();
    await task.populate('assignedTo');
    await task.populate('createdBy');
    await task.populate('pendingStatusChange.requestedBy');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Request status change (Members request, Admin approves)
const requestStatusChange = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { newStatus } = req.body;
    const userId = req.user.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if user is a project member
    const project = await Project.findById(task.projectId);
    const isMember = project.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this project' });
    }

    // Members cannot request same status as current
    if (newStatus === task.status) {
      return res.status(400).json({ error: 'Task already has this status' });
    }

    // Create pending status change request
    task.pendingStatusChange = {
      requestedBy: userId,
      requestedStatus: newStatus,
      requestedAt: new Date(),
    };

    await task.save();
    await task.populate('requestedBy', 'name email');
    await task.populate('assignedTo');
    await task.populate('createdBy');
    await task.populate('pendingStatusChange.requestedBy');

    // Notify project admins
    const admins = project.members.filter(m => m.role === 'Admin');
    const user = await require('../models/User').findById(userId);
    
    for (const admin of admins) {
      const notification = new Notification({
        userId: admin.userId,
        type: 'status_change_request',
        projectId: project._id,
        taskId: task._id,
        message: `${user.name} is requesting to change "${task.title}" status to "${newStatus}"`
      });
      await notification.save();
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// Approve or reject status change (Admin only)
const approveStatusChange = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { approve } = req.body;
    const userId = req.user.userId;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (!task.pendingStatusChange || !task.pendingStatusChange.requestedBy) {
      return res.status(400).json({ error: 'No pending status change for this task' });
    }

    // Check if user is project admin
    const project = await Project.findById(task.projectId);
    const isProjectAdmin = project.members.some(
      m => m.userId.toString() === userId && m.role === 'Admin'
    );

    if (!isProjectAdmin) {
      return res.status(403).json({ error: 'Only project admins can approve status changes' });
    }

    const requesterUser = await require('../models/User').findById(task.pendingStatusChange.requestedBy);
    const admin = await require('../models/User').findById(userId);

    if (approve) {
      // Approve the status change
      task.status = task.pendingStatusChange.requestedStatus;
      
      // Notify requester that their request was approved
      const notification = new Notification({
        userId: task.pendingStatusChange.requestedBy,
        type: 'status_change_approved',
        projectId: project._id,
        taskId: task._id,
        message: `${admin.name} approved your status change for "${task.title}" to "${task.status}"`
      });
      await notification.save();
    } else {
      // Reject the status change
      const notification = new Notification({
        userId: task.pendingStatusChange.requestedBy,
        type: 'status_change_rejected',
        projectId: project._id,
        taskId: task._id,
        message: `${admin.name} rejected your status change request for "${task.title}"`
      });
      await notification.save();
    }

    // Clear pending status change
    task.pendingStatusChange = undefined;
    await task.save();

    await task.populate('assignedTo');
    await task.populate('createdBy');
    await task.populate('pendingStatusChange.requestedBy');

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
  requestStatusChange,
  approveStatusChange,
};
