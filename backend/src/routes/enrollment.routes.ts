import { Router } from 'express';
import * as enrollmentController from '../controllers/enrollment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateIntParam, validateEnum } from '../middleware/validate';

const router = Router();

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

export default router;
