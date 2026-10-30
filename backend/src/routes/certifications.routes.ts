import { Router } from 'express';
import * as certificationsController from '../controllers/certifications.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateIntParam } from '../middleware/validate';

const router = Router();

// GET /api/v1/certifications/me - View personal certificates (woman)
router.get('/me', authenticate, authorize('woman', 'admin'), certificationsController.getMyCertificates);

// POST /api/v1/certifications - Record an authorized certificate (training_provider, admin)
router.post(
  '/',
  authenticate,
  authorize('training_provider', 'admin'),
  validateBody(['womanId', 'programId', 'certificateName']),
  certificationsController.recordCertificate
);

// GET /api/v1/certifications/:id - View certificate details
router.get('/:id', validateIntParam('id'), certificationsController.getCertificateById);

export default router;
