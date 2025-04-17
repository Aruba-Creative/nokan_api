import express from 'express';
import permissionController from '@/controllers/permission.controller';
import { protect, hasPermission } from '@/middlewares';

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(hasPermission('permission:read'), permissionController.getAllPermissions)
  .post(hasPermission('permission:create'), permissionController.createPermission);

router
  .route('/:id')
  .get(hasPermission('permission:read'), permissionController.getPermissionById)
  .patch(hasPermission('permission:update'), permissionController.updatePermission)
  .delete(hasPermission('permission:delete'), permissionController.deletePermission);

export default router;