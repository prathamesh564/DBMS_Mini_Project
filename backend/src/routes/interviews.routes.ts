import { Router } from 'express';
import * as interviewsController from '../controllers/interviews.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateIntParam, validateEnum } from '../middleware/validate';

const router = Router();

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

export default router;
