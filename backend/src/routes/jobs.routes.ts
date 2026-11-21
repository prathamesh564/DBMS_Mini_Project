import { Router } from 'express';
import * as jobsController from '../controllers/jobs.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateIntParam } from '../middleware/validate';

const router = Router();

// GET /api/v1/jobs - List job postings (public)
router.get('/', jobsController.listJobs);

// GET /api/v1/jobs/:id - View job details (public)
router.get('/:id', validateIntParam('id'), jobsController.getJob);

// POST /api/v1/jobs - Publish a job (Admin only per PRD simplification)
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateBody(['jobTitle', 'jobDescription', 'companyName']),
  jobsController.createJob
);

// PUT /api/v1/jobs/:id - Update a job (Admin only)
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateIntParam('id'),
  jobsController.updateJob
);

// DELETE /api/v1/jobs/:id - Delete a job (Admin only)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateIntParam('id'),
  jobsController.deleteJob
);

// POST /api/v1/jobs/:id/apply - Apply for a job (woman candidate)
router.post(
  '/:id/apply',
  authenticate,
  authorize('woman', 'admin'),
  validateIntParam('id'),
  jobsController.applyForJob
);

// GET /api/v1/jobs/:id/applications - View applications for a job (Admin only)
router.get(
  '/:id/applications',
  authenticate,
  authorize('admin'),
  validateIntParam('id'),
  jobsController.getApplicationsForJob
);

export default router;
