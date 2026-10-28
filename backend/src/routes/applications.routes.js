const express = require('express');
const router = express.Router();
const applicationsController = require('../controllers/applications.controller');
const interviewsController = require('../controllers/interviews.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateIntParam, validateEnum, validateBody } = require('../middleware/validate');

// GET /api/v1/applications/me - View personal applications (woman)
router.get('/me', authenticate, authorize('woman', 'admin'), applicationsController.getMyApplications);

// POST /api/v1/applications/:id/interviews - Schedule an interview (PRD Section 7.2)
router.post(
  '/:id/interviews',
  authenticate,
  authorize('employer', 'admin'),
  validateIntParam('id'),
  validateBody(['interviewDate', 'interviewMode']),
  validateEnum('interviewMode', ['Online', 'Offline', 'Telephone']),
  interviewsController.scheduleInterview
);

// GET /api/v1/applications/:id - View application details
router.get('/:id', authenticate, validateIntParam('id'), applicationsController.getApplicationById);

// PATCH /api/v1/applications/:id/status - Update application status (employer, admin)
router.patch(
  '/:id/status',
  authenticate,
  authorize('employer', 'admin'),
  validateIntParam('id'),
  validateBody(['status']),
  validateEnum('status', ['Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Rejected', 'Offered', 'Accepted']),
  applicationsController.updateApplicationStatus
);

module.exports = router;
