import { Request, Response, NextFunction } from 'express';
import Project from '@/models/project.model';
import catchAsync from '@/utils/catch-async';
import AppError from '@/utils/app-error';
import BaseController from './base.controller';
import { validateBody } from '@/middlewares/validation.middleware';
import { CreateProjectDto, UpdateProjectDto, AddStageDto, UpdateStageDto } from '@/dtos/project.dto';
import upload, { getFileUrl, deleteFile } from '@/utils/file-uploader';
import mongoose from 'mongoose';


// Type definitions for multer file uploads
import { File as MulterFileBase } from 'multer';

interface MulterFile extends MulterFileBase {
  filename: string;
}

interface MulterRequest extends Request {
  files?: MulterFile[];
}

class ProjectController extends BaseController {
  /**
   * Get all projects
   * GET /api/v1/projects
   */
  public getAllProjects = this.getAll(Project);

  /**
   * Get a single project by ID
   * GET /api/v1/projects/:id
   */
  public getProjectById = this.getOne(Project, { path: 'links' });

  /**
   * Create a new project
   * POST /api/v1/projects
   */
  public createProject = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Ensure authenticated user is set as the creator
    if (!req.user) {
      return next(new AppError('You must be logged in to create a project', 401));
    }
    
    req.body.createdBy = req.user.id;

    const newProject = await Project.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        project: newProject
      }
    });
  });

  /**
   * Update a project
   * PATCH /api/v1/projects/:id
   */
  public updateProject = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Update fields
    if (req.body.title) project.title = req.body.title;
    if (req.body.description) project.description = req.body.description;
    if (req.body.stages) project.stages = req.body.stages;

    await project.save();

    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  });

  /**
   * Add a stage to a project
   * POST /api/v1/projects/:id/stages
   */
  public addStage = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    const { name, description, images } = req.body;
    
    project.stages.push({
      name,
      description,
      images: images || []
    });

    await project.save();

    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  });

  /**
   * Update a stage
   * PATCH /api/v1/projects/:id/stages/:stageId
   */
  public updateStage = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    const stageIndex = project.stages.findIndex(
        stage => (stage._id as unknown as mongoose.Types.ObjectId).toString() === req.params.stageId
      );

    if (stageIndex === -1) {
      return next(new AppError('No stage found with that ID', 404));
    }

    // Update stage fields
    if (req.body.name) project.stages[stageIndex].name = req.body.name;
    if (req.body.description) project.stages[stageIndex].description = req.body.description;
    if (req.body.images) project.stages[stageIndex].images = req.body.images;

    await project.save();

    res.status(200).json({
      status: 'success',
      data: {
        project
      }
    });
  });

  /**
   * Delete a stage
   * DELETE /api/v1/projects/:id/stages/:stageId
   */
  public deleteStage = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Find the stage to delete
    const stageIndex = project.stages.findIndex(
      stage => (stage._id as unknown as mongoose.Types.ObjectId).toString() === req.params.stageId
    );

    if (stageIndex === -1) {
      return next(new AppError('No stage found with that ID', 404));
    }

    // Before removing the stage, delete all its images from disk
    const stageToDelete = project.stages[stageIndex];
    if (stageToDelete.images && stageToDelete.images.length > 0) {
      stageToDelete.images.forEach(imageUrl => {
        deleteFile(imageUrl);
      });
    }

    // Remove the stage from the array
    project.stages.splice(stageIndex, 1);

    await project.save();

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

  /**
   * Upload images for a stage
   * POST /api/v1/projects/:id/stages/:stageId/images
   */
  public uploadStageImages = catchAsync(async (
    req: MulterRequest,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    const stageIndex = project.stages.findIndex(
      stage => (stage._id as unknown as mongoose.Types.ObjectId).toString() === req.params.stageId
    );

    if (stageIndex === -1) {
      return next(new AppError('No stage found with that ID', 404));
    }

    // Check if any files were uploaded
    if (!req.files || req.files.length === 0) {
      return next(new AppError('No images uploaded', 400));
    }

    // Process uploaded files
    const imageUrls = req.files.map(file => getFileUrl(file.filename));
    
    // Add new images to the stage's images array
    project.stages[stageIndex].images = [
      ...project.stages[stageIndex].images,
      ...imageUrls
    ];

    await project.save();

    res.status(200).json({
      status: 'success',
      data: {
        images: imageUrls,
        stage: project.stages[stageIndex]
      }
    });
  });

  /**
   * Delete an image from a stage
   * DELETE /api/v1/projects/:id/stages/:stageId/images/:imageIndex
   */
  public deleteStageImage = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    const stageIndex = project.stages.findIndex(
      stage => (stage._id as unknown as mongoose.Types.ObjectId).toString() === req.params.stageId
    );

    if (stageIndex === -1) {
      return next(new AppError('No stage found with that ID', 404));
    }

    const imageIndex = parseInt(req.params.imageIndex, 10);
    
    // Check if the image index is valid
    if (isNaN(imageIndex) || imageIndex < 0 || imageIndex >= project.stages[stageIndex].images.length) {
      return next(new AppError('Invalid image index', 400));
    }

    // Get the image URL to delete
    const imageUrl = project.stages[stageIndex].images[imageIndex];
    
    // Delete the file from disk
    deleteFile(imageUrl);
    
    // Remove the image URL from the stage's images array
    project.stages[stageIndex].images.splice(imageIndex, 1);

    await project.save();

    res.status(200).json({
      status: 'success',
      data: {
        stage: project.stages[stageIndex]
      }
    });
  });

  /**
   * Delete a project
   * DELETE /api/v1/projects/:id
   */
  public deleteProject = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return next(new AppError('No document found with that ID', 404));
    }
    
    // Delete all images associated with the project's stages
    project.stages.forEach(stage => {
      if (stage.images && stage.images.length > 0) {
        stage.images.forEach(imageUrl => {
          deleteFile(imageUrl);
        });
      }
    });

    // Delete the project
    await project.deleteOne();

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
}

export default new ProjectController();