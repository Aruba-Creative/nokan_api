import { Request, Response, NextFunction } from 'express';
import Role from '@/models/role.model';
import Permission from '@/models/permission.model';
import catchAsync from '@/utils/catch-async';
import AppError from '@/utils/app-error';
import BaseController from './base.controller';

class RoleController extends BaseController {
  public getAllRoles = this.getAll(Role, { path: 'permissions' });

  public getRoleById = this.getOne(Role, { path: 'permissions' });

  public createRole = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Validate that all permission IDs exist if provided
    if (req.body.permissions && req.body.permissions.length > 0) {
      const permissionIds = req.body.permissions;
      const permissions = await Permission.find({ _id: { $in: permissionIds } });
      
      if (permissions.length !== permissionIds.length) {
        return next(new AppError('One or more permission IDs are invalid', 400));
      }
    }

    // Create the role
    const newRole = await Role.create({
      name: req.body.name,
      description: req.body.description,
      permissions: req.body.permissions || [],
    });

    // Populate permissions
    await newRole.populate('permissions');

    res.status(201).json({
      status: 'success',
      data: {
        role: newRole,
      },
    });
  });

  public updateRole = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Find the role
    const role = await Role.findById(req.params.id);
    if (!role) {
      return next(new AppError('No role found with that ID', 404));
    }

    // Update basic info
    role.name = req.body.name || role.name;
    role.description = req.body.description || role.description;

    // Save changes
    await role.save();
    
    // Populate permissions and return
    await role.populate('permissions');

    res.status(200).json({
      status: 'success',
      data: {
        role,
      },
    });
  });

  public updateRolePermissions = catchAsync(async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Check if permissions array is provided
    if (!req.body.permissions || !Array.isArray(req.body.permissions)) {
      return next(new AppError('Please provide an array of permission IDs', 400));
    }

    // Validate that all permission IDs exist
    const permissionIds = req.body.permissions;
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    
    if (permissions.length !== permissionIds.length) {
      return next(new AppError('One or more permission IDs are invalid', 400));
    }

    // Find and update the role
    const role = await Role.findById(req.params.id);
    if (!role) {
      return next(new AppError('No role found with that ID', 404));
    }

    // Update permissions
    role.permissions = permissionIds;
    await role.save();

    // Populate permissions and return
    await role.populate('permissions');

    res.status(200).json({
      status: 'success',
      data: {
        role,
      },
    });
  });

  public deleteRole = this.deleteOne(Role);
}

export default new RoleController();