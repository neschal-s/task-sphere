const express = require('express');
const { signup, login } = require('../controllers/authController');
const { signupValidators, loginValidators, validate } = require('../utils/validators');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', signupValidators, validate, signup);

// POST /api/auth/login
router.post('/login', loginValidators, validate, login);

module.exports = router;
