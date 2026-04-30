const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationController');

const router = express.Router();

router.use(authMiddleware);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/count/unread', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllAsRead);

// Mark single notification as read
router.patch('/:notificationId/read', markAsRead);

module.exports = router;
