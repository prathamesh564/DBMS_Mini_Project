import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, validateEmail, validateEnum } from '../middleware/validate';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  validateBody(['email', 'password', 'role']),
  validateEmail('email'),
  validateEnum('role', ['woman', 'training_provider', 'employer', 'admin']),
  authController.register
);

// POST /api/v1/auth/login
router.post(
  '/login',
  validateBody(['email', 'password']),
  validateEmail('email'),
  authController.login
);

// GET /api/v1/auth/me
router.get('/me', authenticate, authController.getMe);

export default router;
