const Notification = require('../models/Notification');

// Get user notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { unreadOnly = false } = req.query;

    let query = { userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .populate('projectId', 'name')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    next(error);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// Get unread count
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const count = await Notification.countDocuments({
      userId,
      read: false
    });

    res.json({ unreadCount: count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};
