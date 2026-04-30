const Project = require('../models/Project');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create a new project
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const userId = req.user.userId;

    const project = new Project({
      name,
      description,
      creator: userId,
      members: [
        {
          userId,
          role: 'Admin',
        },
      ],
    });

    await project.save();
    await project.populate('creator');
    await project.populate('members.userId');

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

// Get all projects for a user
const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const projects = await Project.find({
      'members.userId': userId,
    })
      .populate('creator')
      .populate('members.userId');

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

// Get project by ID
const getProjectById = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    const project = await Project.findById(projectId)
      .populate('creator')
      .populate('members.userId');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is a member
    const isMember = project.members.some(m => m.userId._id.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Add member to project (Admin only)
const addMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is an Admin
    const adminMember = project.members.find(
      m => m.userId.toString() === userId && m.role === 'Admin'
    );
    if (!adminMember) {
      return res.status(403).json({ error: 'Only admins can add members' });
    }

    // Find user by email
    const newUser = await User.findOne({ email });
    if (!newUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is already a member
    const alreadyMember = project.members.some(
      m => m.userId.toString() === newUser._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    // Add member
    project.members.push({
      userId: newUser._id,
      role: role || 'Member',
    });

    await project.save();
    await project.populate('creator');
    await project.populate('members.userId');

    // Create notification for added user
    const notification = new Notification({
      userId: newUser._id,
      type: 'added_to_project',
      projectId: project._id,
      message: `You have been added to project "${project.name}"`
    });
    await notification.save();

    res.json(project);
  } catch (error) {
    next(error);
  }
};

// Remove member from project (Admin only)
const removeMember = async (req, res, next) => {
  try {
    const { projectId, memberId } = req.params;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is an Admin
    const adminMember = project.members.find(
      m => m.userId.toString() === userId && m.role === 'Admin'
    );
    if (!adminMember) {
      return res.status(403).json({ error: 'Only admins can remove members' });
    }

    // Check if trying to remove the creator
    if (project.creator.toString() === memberId) {
      return res.status(400).json({ error: 'Cannot remove project creator' });
    }

    // Remove member
    project.members = project.members.filter(
      m => m.userId.toString() !== memberId
    );

    await project.save();
    await project.populate('creator');
    await project.populate('members.userId');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getUserProjects,
  getProjectById,
  addMember,
  removeMember,
};
