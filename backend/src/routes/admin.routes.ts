import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { validateIntParam, validateEnum, validateBody } from '../middleware/validate';

const router = Router();

// Protect all admin routes: require authentication and admin role
router.use(authenticate, authorize('admin'));

// GET /api/v1/admin/statistics - Retrieve authorized dashboard statistics (PRD Section 7.2)
router.get('/statistics', adminController.getStatistics);

// GET /api/v1/admin/users - List users
router.get('/users', adminController.listUsers);

// PATCH /api/v1/admin/users/:id/role - Update user role
router.patch(
  '/users/:id/role',
  validateIntParam('id'),
  validateBody(['role']),
  validateEnum('role', ['woman', 'training_provider', 'employer', 'admin']),
  adminController.updateUserRole
);

export default router;
