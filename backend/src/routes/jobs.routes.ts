import { Router } from 'express';
import * as jobsController from '../controllers/jobs.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateIntParam } from '../middleware/validate';

const router = Router();

// GET /api/v1/jobs - List job postings (public)
router.get('/', jobsController.listJobs);

// GET /api/v1/jobs/:id - View job details
router.get('/:id', validateIntParam('id'), jobsController.getJob);

// POST /api/v1/jobs - Publish a job (employer, admin)
router.post(
  '/',
  authenticate,
  authorize('employer', 'admin'),
  validateBody(['jobTitle', 'jobDescription']),
  jobsController.createJob
);

// PUT /api/v1/jobs/:id - Update a job (employer, admin)
router.put(
  '/:id',
  authenticate,
  authorize('employer', 'admin'),
  validateIntParam('id'),
  jobsController.updateJob
);

// POST /api/v1/jobs/:id/apply - Apply for a job (woman)
router.post(
  '/:id/apply',
  authenticate,
  authorize('woman', 'admin'),
  validateIntParam('id'),
  jobsController.applyForJob
);

// GET /api/v1/jobs/:id/applications - View applications for an employer's job
router.get(
  '/:id/applications',
  authenticate,
  authorize('employer', 'admin'),
  validateIntParam('id'),
  jobsController.getApplicationsForJob
);

export default router;
