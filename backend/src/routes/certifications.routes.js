const express = require('express');
const router = express.Router();
const certificationsController = require('../controllers/certifications.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateBody, validateIntParam } = require('../middleware/validate');

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

module.exports = router;
