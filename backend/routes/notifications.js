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

// Specific routes first (before parameterized routes)
router.get('/count/unread', getUnreadCount);
router.patch('/read-all', markAllAsRead);

// Parameterized routes
router.get('/', getNotifications);
router.patch('/:notificationId/read', markAsRead);

module.exports = router;
