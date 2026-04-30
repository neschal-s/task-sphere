const Task = require('../models/Task');
const Project = require('../models/Project');
const TaskStatusRequest = require('../models/TaskStatusRequest');
const Notification = require('../models/Notification');
const { validationResult } = require('express-validator');

// Request status change
exports.requestStatusChange = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { taskId, projectId, requestedStatus, reason } = req.body;
    const userId = req.user.userId;

    // Get task and project
    const task = await Task.findById(taskId);
    const project = await Project.findById(projectId).populate('members.userId');

    if (!task || !project) {
      return res.status(404).json({ message: 'Task or project not found' });
    }

    // Verify user is a member of the project
    const isMember = project.members.some(m => m.userId._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this project' });
    }

    // Check if request already pending for this task
    const existingRequest = await TaskStatusRequest.findOne({
      taskId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A status change request is already pending for this task' });
    }

    // Create status change request
    const statusRequest = new TaskStatusRequest({
      taskId,
      projectId,
      requestedBy: userId,
      requestedStatus,
      currentStatus: task.status,
      reason
    });

    await statusRequest.save();
    await statusRequest.populate(['requestedBy', 'taskId']);

    // Send notification to project admin
    const admin = project.members.find(m => m.role === 'Admin');
    if (admin) {
      const notification = new Notification({
        userId: admin.user._id,
        type: 'status_change_requested',
        projectId,
        taskId,
        message: `${statusRequest.requestedBy.name} requested to change "${task.title}" status from "${task.status}" to "${requestedStatus}"`
      });
      await notification.save();
    }

    res.status(201).json(statusRequest);
  } catch (error) {
    console.error('Error requesting status change:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get pending status change requests for a project (admin only)
exports.getPendingRequests = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Get project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is admin
    const adminMember = project.members.find(m => m.userId.toString() === userId && m.role === 'Admin');
    if (!adminMember) {
      return res.status(403).json({ message: 'Only project admin can view status requests' });
    }

    // Get pending requests
    const requests = await TaskStatusRequest.find({
      projectId,
      status: 'pending'
    })
      .populate('requestedBy', 'name email')
      .populate('taskId', 'title description')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Approve status change request
exports.approveStatusChange = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approvalReason } = req.body;
    const userId = req.user.userId;

    // Get the request
    const statusRequest = await TaskStatusRequest.findById(requestId)
      .populate('projectId')
      .populate('taskId');

    if (!statusRequest) {
      return res.status(404).json({ message: 'Status request not found' });
    }

    // Check if user is admin
    const project = statusRequest.projectId;
    const adminMember = project.members.find(m => m.userId.toString() === userId && m.role === 'Admin');
    if (!adminMember) {
      return res.status(403).json({ message: 'Only project admin can approve requests' });
    }

    // Update status request
    statusRequest.status = 'approved';
    statusRequest.approvedBy = userId;
    statusRequest.approvalReason = approvalReason;
    await statusRequest.save();

    // Update task status
    const task = statusRequest.taskId;
    task.status = statusRequest.requestedStatus;
    await task.save();

    // Send notification to the user who made the request
    const notification = new Notification({
      userId: statusRequest.requestedBy,
      type: 'status_change_approved',
      projectId: statusRequest.projectId,
      taskId: statusRequest.taskId,
      message: `Your request to change "${task.title}" status to "${statusRequest.requestedStatus}" has been approved`
    });
    await notification.save();

    await statusRequest.populate(['requestedBy', 'approvedBy', 'taskId']);

    res.json({
      message: 'Status change approved',
      statusRequest
    });
  } catch (error) {
    console.error('Error approving status change:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reject status change request
exports.rejectStatusChange = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectionReason } = req.body;
    const userId = req.user.userId;

    // Get the request
    const statusRequest = await TaskStatusRequest.findById(requestId)
      .populate('projectId')
      .populate('taskId');

    if (!statusRequest) {
      return res.status(404).json({ message: 'Status request not found' });
    }

    // Check if user is admin
    const project = statusRequest.projectId;
    const adminMember = project.members.find(m => m.userId.toString() === userId && m.role === 'Admin');
    if (!adminMember) {
      return res.status(403).json({ message: 'Only project admin can reject requests' });
    }

    // Update status request
    statusRequest.status = 'rejected';
    statusRequest.approvedBy = userId;
    statusRequest.approvalReason = rejectionReason;
    await statusRequest.save();

    // Send notification to the user who made the request
    const task = statusRequest.taskId;
    const notification = new Notification({
      userId: statusRequest.requestedBy,
      type: 'status_change_rejected',
      projectId: statusRequest.projectId,
      taskId: statusRequest.taskId,
      message: `Your request to change "${task.title}" status to "${statusRequest.requestedStatus}" has been rejected`
    });
    await notification.save();

    await statusRequest.populate(['requestedBy', 'approvedBy', 'taskId']);

    res.json({
      message: 'Status change rejected',
      statusRequest
    });
  } catch (error) {
    console.error('Error rejecting status change:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get status request history for a task
exports.getTaskRequestHistory = async (req, res) => {
  try {
    const { taskId } = req.params;

    const requests = await TaskStatusRequest.find({ taskId })
      .populate('requestedBy', 'name email')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error getting task request history:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
