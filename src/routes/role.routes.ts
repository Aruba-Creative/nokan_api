import express from 'express';
import roleController from '@/controllers/role.controller';
import { protect, hasPermission } from '@/middlewares';

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(hasPermission('role:read'), roleController.getAllRoles)
  .post(hasPermission('role:create'), roleController.createRole);

router
  .route('/:id')
  .get(hasPermission('role:read'), roleController.getRoleById)
  .patch(hasPermission('role:update'), roleController.updateRole)
  .delete(hasPermission('role:delete'), roleController.deleteRole);

// Route to add permissions to a role
router.patch(
  '/:id/permissions',
  hasPermission('role:update'),
  roleController.updateRolePermissions
);

export default router;