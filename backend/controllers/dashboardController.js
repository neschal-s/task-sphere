const Task = require('../models/Task');
const Project = require('../models/Project');

// Get dashboard stats for a project
const getDashboardStats = async (req, res, next) => {
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

    // Get all tasks for the project
    const allTasks = await Task.find({ projectId });

    // Total tasks count
    const totalTasks = allTasks.length;

    // Tasks by status
    const tasksByStatus = {
      'To Do': allTasks.filter(t => t.status === 'To Do').length,
      'In Progress': allTasks.filter(t => t.status === 'In Progress').length,
      'Done': allTasks.filter(t => t.status === 'Done').length,
    };

    // Tasks per user (assigned tasks count)
    const tasksPerUser = {};
    allTasks.forEach(task => {
      if (task.assignedTo) {
        const userId = task.assignedTo.toString();
        tasksPerUser[userId] = (tasksPerUser[userId] || 0) + 1;
      }
    });

    // Populate user names for tasks per user
    const userIds = Object.keys(tasksPerUser).map(id => id);
    const users = await require('../models/User').find(
      { _id: { $in: userIds } },
      'name'
    );

    const tasksPerUserWithNames = {};
    users.forEach(user => {
      tasksPerUserWithNames[user.name] = tasksPerUser[user._id.toString()];
    });

    // Overdue tasks
    const now = new Date();
    const overdueTasks = allTasks
      .filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate()));

    // Populate overdue task details
    await Task.populate(overdueTasks, [
      { path: 'assignedTo' },
      { path: 'createdBy' },
    ]);

    res.json({
      totalTasks,
      tasksByStatus,
      tasksPerUser: tasksPerUserWithNames,
      overdueTasksCount: overdueTasks.length,
      overdueTasks: overdueTasks.map(t => ({
        _id: t._id,
        title: t.title,
        dueDate: t.dueDate,
        assignedTo: t.assignedTo,
        status: t.status,
        priority: t.priority,
      })),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats };
