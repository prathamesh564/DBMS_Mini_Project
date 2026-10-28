const express = require('express');
const router = express.Router();
const employmentController = require('../controllers/employment.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateBody, validateIntParam, validateEnum } = require('../middleware/validate');

// GET /api/v1/employment/me - View personal employment records (woman)
router.get('/me', authenticate, authorize('woman', 'admin'), employmentController.getMyEmployment);

// POST /api/v1/employment - Record a verified placement (employer, admin)
router.post(
  '/',
  authenticate,
  authorize('employer', 'admin'),
  validateBody(['womanId', 'jobId', 'salary']),
  employmentController.recordPlacement
);

// GET /api/v1/employment/:id - View employment record
router.get('/:id', authenticate, validateIntParam('id'), employmentController.getEmploymentById);

// PATCH /api/v1/employment/:id - Update employment status
router.patch(
  '/:id',
  authenticate,
  authorize('employer', 'admin'),
  validateIntParam('id'),
  validateEnum('employmentStatus', ['Active', 'Probation', 'Resigned', 'Terminated']),
  employmentController.updateEmploymentStatus
);

module.exports = router;
