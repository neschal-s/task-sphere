const ChatMessage = require('../models/ChatMessage');
const Project = require('../models/Project');

// Send chat message
const sendMessage = async (req, res, next) => {
  try {
    const { projectId, message } = req.body;
    const userId = req.user.userId;

    if (!projectId || !message) {
      return res.status(400).json({ error: 'projectId and message are required' });
    }

    // Check if user is member of project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Create message
    const chatMessage = new ChatMessage({
      projectId,
      userId,
      message
    });

    await chatMessage.save();
    await chatMessage.populate('userId', 'name email');

    res.status(201).json(chatMessage);
  } catch (error) {
    next(error);
  }
};

// Get chat messages for a project
const getProjectMessages = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const { limit = 50, skip = 0 } = req.query;

    // Check if user is member of project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const isMember = project.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get messages
    const messages = await ChatMessage.find({ projectId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ChatMessage.countDocuments({ projectId });

    res.json({ messages: messages.reverse(), total });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  getProjectMessages
};
