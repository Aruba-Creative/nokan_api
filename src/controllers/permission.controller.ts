import { Request, Response, NextFunction } from 'express';
import Permission from '@/models/permission.model';
import catchAsync from '@/utils/catch-async';
import AppError from '@/utils/app-error';
import BaseController from './base.controller';

class PermissionController extends BaseController {
  public getAllPermissions = this.getAll(Permission);

  public getPermissionById = this.getOne(Permission);

  public createPermission = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Check if permission already exists
    const existingPermission = await Permission.findOne({ name: req.body.name });
    if (existingPermission) {
      return next(new AppError('Permission with this name already exists', 400));
    }

    // Create the permission
    const newPermission = await Permission.create({
      name: req.body.name,
      description: req.body.description,
    });

    res.status(201).json({
      status: 'success',
      data: {
        permission: newPermission,
      },
    });
  });

  public updatePermission = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Find the permission
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return next(new AppError('No permission found with that ID', 404));
    }

    // Check if name is being changed and if it conflicts with existing permission
    if (req.body.name && req.body.name !== permission.name) {
      const existingPermission = await Permission.findOne({ name: req.body.name });
      if (existingPermission) {
        return next(new AppError('Permission with this name already exists', 400));
      }
    }

    // Update fields
    permission.name = req.body.name || permission.name;
    permission.description = req.body.description || permission.description;

    // Save changes
    await permission.save();

    res.status(200).json({
      status: 'success',
      data: {
        permission,
      },
    });
  });

  public deletePermission = this.deleteOne(Permission);
}

export default new PermissionController();