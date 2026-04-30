const express = require('express');
const { signup, login } = require('../controllers/authController');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map(e => ({ field: e.param, message: e.msg }))
    });
  }
  next();
};

// POST /api/auth/signup
router.post('/signup',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
  signup
);

// POST /api/auth/login
router.post('/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
  login
);

module.exports = router;
