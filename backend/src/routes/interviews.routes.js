const express = require('express');
const router = express.Router();
const interviewsController = require('../controllers/interviews.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateIntParam, validateEnum } = require('../middleware/validate');

// GET /api/v1/interviews/me - View authorized interview schedules
router.get('/me', authenticate, interviewsController.getMyInterviews);

// GET /api/v1/interviews/:id - View interview details
router.get('/:id', authenticate, validateIntParam('id'), interviewsController.getInterviewById);

// PATCH /api/v1/interviews/:id - Update interview details or status (employer, admin)
router.patch(
  '/:id',
  authenticate,
  authorize('employer', 'admin'),
  validateIntParam('id'),
  validateEnum('interviewMode', ['Online', 'Offline', 'Telephone']),
  validateEnum('interviewStatus', ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled']),
  interviewsController.updateInterview
);

module.exports = router;
