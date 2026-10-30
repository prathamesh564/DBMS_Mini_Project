import { Router } from 'express';
import * as employersController from '../controllers/employers.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateEmail, validateIntParam } from '../middleware/validate';

const router = Router();

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

export default router;
