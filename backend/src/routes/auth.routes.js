const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/authenticate');
const { validateBody, validateEmail, validateEnum } = require('../middleware/validate');

// POST /api/v1/auth/register
router.post(
  '/register',
  validateBody(['email', 'password', 'role']),
  validateEmail('email'),
  validateEnum('role', ['woman', 'training_provider', 'employer', 'admin']),
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  validateBody(['email', 'password']),
  validateEmail('email'),
  authController.login
);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getMe);

module.exports = router;
