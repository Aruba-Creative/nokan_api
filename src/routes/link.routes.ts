import express from 'express';
import linkController from '@/controllers/link.controller';
import { protect, hasPermission, validateBody } from '@/middlewares';
import { CreateLinkDto, UpdateLinkDto } from '@/dtos/link.dto';

const router = express.Router();

// Public route for accessing a link - no authentication required
router.get('/access/:id', linkController.accessLink);

// Protect all other routes
router.use(protect);

// Link routes
router
  .route('/')
  .get(hasPermission('link:read'), linkController.getAllLinks)
  .post(
    hasPermission('link:create'), 
    validateBody(CreateLinkDto),
    linkController.createLink);

router
  .route('/:id')
  .get(hasPermission('link:read'), linkController.getLinkById)
  .patch(
    hasPermission('link:update'), 
    validateBody(UpdateLinkDto),
    linkController.updateLink)
  .delete(hasPermission('link:delete'), linkController.deleteLink);

// Link statistics
router
  .route('/:id/stats')
  .get(hasPermission('link:read'), linkController.getLinkStats);

export default router;