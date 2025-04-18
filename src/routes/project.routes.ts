import express from 'express';
import projectController from '@/controllers/project.controller';
import { protect, hasPermission, validateBody } from '@/middlewares';
import { CreateProjectDto, UpdateProjectDto, AddStageDto, UpdateStageDto } from '@/dtos/project.dto';
import upload from '@/utils/file-uploader';
const router = express.Router();

// Protect all routes
router.use(protect);

// Project routes
router
  .route('/')
  .get(hasPermission('project:read'), projectController.getAllProjects)
  .post(
    hasPermission('project:create'), 
    validateBody(CreateProjectDto),
    projectController.createProject);

router
  .route('/:id')
  .get(hasPermission('project:read'), projectController.getProjectById)
  .patch(
    hasPermission('project:update'), 
    validateBody(UpdateProjectDto),
    projectController.updateProject)
  .delete(hasPermission('project:delete'), projectController.deleteProject);

// Stage routes (nested under projects)
router
  .route('/:id/stages')
  .post(
    hasPermission('project:update'), 
    validateBody(AddStageDto),
    projectController.addStage);

router
  .route('/:id/stages/:stageId')
  .patch(
    hasPermission('project:update'), 
    validateBody(UpdateStageDto),
    projectController.updateStage)
  .delete(hasPermission('project:update'), projectController.deleteStage);

// Image upload routes for stages
router
  .route('/:id/stages/:stageId/images')
  .post(
    hasPermission('project:update'),
    upload.array('images', 5), // Allow up to 5 images to be uploaded at once
    projectController.uploadStageImages
  );

router
  .route('/:id/stages/:stageId/images/:imageIndex')
  .delete(
    hasPermission('project:update'),
    projectController.deleteStageImage
  );

export default router;