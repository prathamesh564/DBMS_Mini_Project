import { Router } from 'express';
import * as skillsController from '../controllers/skills.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateBody, validateIntParam } from '../middleware/validate';

const router = Router();

// GET /api/v1/skills - List skills (publicly viewable by all users)
router.get('/', skillsController.getAllSkills);

// GET /api/v1/skills/:id - Get skill by ID
router.get('/:id', validateIntParam('id'), skillsController.getSkillById);

// POST /api/v1/skills - Create a skill; authorized role required (admin, training_provider)
router.post(
  '/',
  authenticate,
  authorize('admin', 'training_provider'),
  validateBody(['skillName', 'category']),
  skillsController.createSkill
);

// PUT /api/v1/skills/:id - Update skill (admin)
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateIntParam('id'),
  skillsController.updateSkill
);

// DELETE /api/v1/skills/:id - Delete skill (admin)
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  validateIntParam('id'),
  skillsController.deleteSkill
);

export default router;
