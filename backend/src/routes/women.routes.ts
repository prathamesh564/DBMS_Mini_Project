import { Router } from 'express';
import * as womenController from '../controllers/women.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateIntParam, validateEnum } from '../middleware/validate';

const router = Router();

// GET /api/v1/women/me - Get logged-in woman's profile
router.get('/me', authenticate, authorize('woman', 'admin'), womenController.getMyProfile);

// PUT /api/v1/women/me - Update logged-in woman's profile
router.put('/me', authenticate, authorize('woman', 'admin'), womenController.updateMyProfile);

// POST /api/v1/women/me/skills - Add skill to woman's profile
router.post(
  '/me/skills',
  authenticate,
  authorize('woman', 'admin'),
  validateBody(['skillId']),
  validateEnum('proficiencyLevel', ['Beginner', 'Intermediate', 'Advanced', 'Expert']),
  womenController.addSkill
);

// DELETE /api/v1/women/me/skills/:skillId - Remove skill from profile
router.delete(
  '/me/skills/:skillId',
  authenticate,
  authorize('woman', 'admin'),
  validateIntParam('skillId'),
  womenController.removeSkill
);

// GET /api/v1/women - List women (employers, training providers, admin)
router.get('/', authenticate, authorize('employer', 'training_provider', 'admin'), womenController.listWomen);

// GET /api/v1/women/:id - View an authorized woman's profile
router.get('/:id', authenticate, validateIntParam('id'), womenController.getWomanById);

export default router;
