const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollment.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateIntParam, validateEnum } = require('../middleware/validate');

// GET /api/v1/enrollments - List enrollments (training_provider, admin)
router.get('/', authenticate, authorize('training_provider', 'admin'), enrollmentController.listEnrollments);

// GET /api/v1/enrollments/:id - View enrollment details
router.get('/:id', authenticate, validateIntParam('id'), enrollmentController.getEnrollmentById);

// PATCH /api/v1/enrollments/:id - Update completion status and score (training_provider, admin)
router.patch(
  '/:id',
  authenticate,
  authorize('training_provider', 'admin'),
  validateIntParam('id'),
  validateEnum('completionStatus', ['Enrolled', 'In Progress', 'Completed', 'Dropped']),
  enrollmentController.updateEnrollmentStatus
);

module.exports = router;
