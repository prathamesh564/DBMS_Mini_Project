import { Router } from 'express';
import * as trainingController from '../controllers/training.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateIntParam } from '../middleware/validate';

const router = Router();

// GET /api/v1/training/programs - List training programs (public)
router.get('/programs', trainingController.listPrograms);

// GET /api/v1/training/enrollments/me - View personal enrollments (woman)
router.get('/enrollments/me', authenticate, authorize('woman', 'admin'), trainingController.getMyEnrollments);

// GET /api/v1/training/programs/:id - Get program details
router.get('/programs/:id', validateIntParam('id'), trainingController.getProgram);

// POST /api/v1/training/programs - Create a program (training_provider, admin)
router.post(
  '/programs',
  authenticate,
  authorize('training_provider', 'admin'),
  validateBody(['programName', 'durationWeeks']),
  trainingController.createProgram
);

// PUT /api/v1/training/programs/:id - Update a program (training_provider, admin)
router.put(
  '/programs/:id',
  authenticate,
  authorize('training_provider', 'admin'),
  validateIntParam('id'),
  trainingController.updateProgram
);

// POST /api/v1/training/programs/:id/enroll - Enroll in a program (woman)
router.post(
  '/programs/:id/enroll',
  authenticate,
  authorize('woman', 'admin'),
  validateIntParam('id'),
  trainingController.enroll
);

export default router;
