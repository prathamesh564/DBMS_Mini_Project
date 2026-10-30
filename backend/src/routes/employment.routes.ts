import { Router } from 'express';
import * as employmentController from '../controllers/employment.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateIntParam, validateEnum } from '../middleware/validate';

const router = Router();

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

export default router;
