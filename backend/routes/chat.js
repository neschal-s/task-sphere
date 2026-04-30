const express = require('express');
const { body, validationResult } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { sendMessage, getProjectMessages } = require('../controllers/chatController');

const router = express.Router();

router.use(authMiddleware);

// Send message
router.post(
  '/',
  body('projectId').notEmpty().withMessage('projectId is required'),
  body('message').notEmpty().trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
  },
  sendMessage
);

// Get project messages
router.get('/:projectId', getProjectMessages);

module.exports = router;
