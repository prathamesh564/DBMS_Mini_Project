const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const { validateIntParam, validateEnum, validateBody } = require('../middleware/validate');

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

module.exports = router;
