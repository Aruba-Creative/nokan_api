import { Request, Response, NextFunction } from 'express';
import Link from '@/models/link.model';
import Project from '@/models/project.model';
import catchAsync from '@/utils/catch-async';
import AppError from '@/utils/app-error';
import BaseController from './base.controller';
import { validateBody } from '@/middlewares/validation.middleware';
import { CreateLinkDto, UpdateLinkDto } from '@/dtos/link.dto';
import visitorTracker from '@/utils/visitor-tracker';

class LinkController extends BaseController {
  /**
   * Get all links
   * GET /api/v1/links
   */
  public getAllLinks = this.getAll(Link);

  /**
   * Get a single link by ID
   * GET /api/v1/links/:id
   */
  public getLinkById = this.getOne(Link);

  /**
   * Create a new link
   * POST /api/v1/links
   */
  public createLink = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Ensure authenticated user is set as the creator
    if (!req.user) {
      return next(new AppError('You must be logged in to create a link', 401));
    }
    
    // Check if project exists
    const project = await Project.findById(req.body.project);
    if (!project) {
      return next(new AppError('No project found with that ID', 404));
    }

    // Set creator
    req.body.createdBy = req.user.id;

    const newLink = await Link.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        link: newLink
      }
    });
  });

  /**
   * Update a link
   * PATCH /api/v1/links/:id
   */
  public updateLink = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const link = await Link.findById(req.params.id);
    
    if (!link) {
      return next(new AppError('No link found with that ID', 404));
    }

    // Update fields
    if (req.body.startDate) link.startDate = new Date(req.body.startDate);
    if (req.body.endDate) link.endDate = new Date(req.body.endDate);
    if (req.body.isActive !== undefined) link.isActive = req.body.isActive;

    await link.save();

    res.status(200).json({
      status: 'success',
      data: {
        link
      }
    });
  });

  /**
   * Delete a link
   * DELETE /api/v1/links/:id
   */
  public deleteLink = this.deleteOne(Link);

  /**
   * Access a shared link (public route)
   * GET /api/v1/links/access/:id
   */
  public accessLink = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const link = await Link.findById(req.params.id);
    
    if (!link) {
      return next(new AppError('Invalid link', 404));
    }

    // Check if link is accessible
    if (!link.isAccessible()) {
      if (link.isExpired()) {
        return next(new AppError('This link has expired', 403));
      }
      if (!link.isActive) {
        return next(new AppError('This link is no longer active', 403));
      }
      if (new Date() < link.startDate) {
        return next(new AppError('This link is not yet active', 403));
      }
    }

    // Track the visit (this handles incrementing openCount and adding visitor data)
    await visitorTracker.trackVisit(link._id.toString(), req);

    // Return project data
    res.status(200).json({
      status: 'success',
      data: {
        project: link.project
      }
    });
  });

  /**
   * Get link statistics
   * GET /api/v1/links/:id/stats
   */
  public getLinkStats = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const link = await Link.findById(req.params.id);
    
    if (!link) {
      return next(new AppError('No link found with that ID', 404));
    }

    // Get stats using the visitor tracker utility
    const visitorStats = visitorTracker.getVisitorStats(link);
    
    const stats = {
      ...visitorStats,
      isActive: link.isActive,
      isExpired: link.isExpired(),
      startDate: link.startDate,
      endDate: link.endDate,
      project: link.project
    };

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  });
}

export default new LinkController();