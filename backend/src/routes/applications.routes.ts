import { Router } from 'express';
import * as applicationsController from '../controllers/applications.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateIntParam, validateEnum, validateBody } from '../middleware/validate';

const router = Router();

// GET /api/v1/applications/me - View personal applications (woman)
router.get('/me', authenticate, authorize('woman', 'admin'), applicationsController.getMyApplications);

// GET /api/v1/applications - View all applications across all jobs (admin)
router.get('/', authenticate, authorize('admin'), applicationsController.listAllApplications);

// GET /api/v1/applications/:id - View application details
router.get('/:id', authenticate, validateIntParam('id'), applicationsController.getApplicationById);

// PATCH /api/v1/applications/:id/status - Update application status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  authorize('admin'),
  validateIntParam('id'),
  validateBody(['status']),
  validateEnum('status', ['Applied', 'Reviewed', 'Shortlisted', 'Interviewing', 'Rejected', 'Offered', 'Accepted']),
  applicationsController.updateApplicationStatus
);

export default router;
