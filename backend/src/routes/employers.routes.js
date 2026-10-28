const express = require('express');
const router = express.Router();
const employersController = require('../controllers/employers.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateBody, validateEmail, validateIntParam } = require('../middleware/validate');

// GET /api/v1/employers/me - View current employer profile
router.get('/me', authenticate, authorize('employer', 'admin'), employersController.getMyProfile);

// PUT /api/v1/employers/me - Update current employer profile
router.put('/me', authenticate, authorize('employer', 'admin'), employersController.updateMyProfile);

// POST /api/v1/employers - Create an employer profile
router.post(
  '/',
  authenticate,
  authorize('employer', 'admin'),
  validateBody(['companyName', 'industry']),
  validateEmail('email'),
  employersController.createEmployer
);

// GET /api/v1/employers - List all employers (public)
router.get('/', employersController.listEmployers);

// GET /api/v1/employers/:id - View employer profile
router.get('/:id', validateIntParam('id'), employersController.getEmployerById);

module.exports = router;
