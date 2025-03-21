import { Request, Response, NextFunction } from 'express';
import { Model, Document, PopulateOptions } from 'mongoose';
import catchAsync from '@/utils/catch-async';
import AppError from '@/utils/app-error';
import APIFeatures from '@/utils/api-features';

export default class BaseController {
  
  public deleteOne<T extends Document>(Model: Model<T>) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const doc = await Model.findById(req.params.id);

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      await doc.deleteOne();

      res.status(204).json({
        status: 'success',
        data: null,
      });
    });
  }

  public updateOne<T extends Document>(Model: Model<T>) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      const doc = await Model.findById(req.params.id);

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      Object.assign(doc, req.body);

      await doc.save({ validateBeforeSave: false });

      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    });
  }

  public createOne<T extends Document>(Model: Model<T>, popOptions?: PopulateOptions | PopulateOptions[]) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      if (req.user) {
        req.body.addedBy = req.user.id;
      }

      let query = Model.create(req.body);
      const doc = await query;
      
      // Fixed Error 1: Use any type to avoid TypeScript errors
      let result: any = doc;
      if (popOptions) {
        result = await Model.findById(doc._id).populate(popOptions);
      }

      res.status(201).json({
        status: 'success',
        data: {
          data: result,
        },
      });

      next();
    });
  }

  public getOne<T extends Document>(Model: Model<T>, popOptions?: PopulateOptions | PopulateOptions[]) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      // Fixed Error 2: Use any type for query to avoid compatibility issues
      let query: any = Model.findById(req.params.id);
      if (popOptions) query = query.populate(popOptions);
      const doc = await query;

      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          data: doc,
        },
      });
    });
  }

  public getAll<T extends Document>(Model: Model<T>, popOptions?: PopulateOptions | PopulateOptions[]) {
    return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      let filter: any = {};

      // Check for startDate and endDate in the request body
      if (req.body.startDate || req.body.endDate) {
        // Parse startDate and endDate if provided
        if (req.body.startDate) {
          filter.createdAt = { $gte: new Date(req.body.startDate) }; // Filter for startDate (>=)
        }
        if (req.body.endDate) {
          // Ensure endDate is after startDate or current date if not provided
          if (!filter.createdAt) {
            filter.createdAt = {}; // Create empty filter if only endDate is present
          }
          filter.createdAt.$lte = new Date(req.body.endDate); // Filter for endDate (<=)
        }
      }

      // Fixed Error 3: Use any type for query to avoid compatibility issues
      let query: any = Model.find(filter);
      if (popOptions) query = query.populate(popOptions);

      const page = parseInt(req.query.page as string) || 1;
      const perPage = parseInt(req.query.limit as string) || 10;

      const features = new APIFeatures(query, req.query as any)
        .filter()
        .sort()
        .limitFields();

      let mainDocs = await features.query;

      if (!Array.isArray(mainDocs)) {
        return res.status(500).json({
          status: 'error',
          message: 'Main documents are not an array',
        });
      }

      const mainDocsSkip = (page - 1) * perPage;
      const newMainDoc = mainDocs.slice(mainDocsSkip, mainDocsSkip + perPage);

      let data: any = newMainDoc;
      if (req.body != null && req.body.daxilaTotalPrice) {
        data = {
          totalDaxilaPrice: req.body.daxilaTotalPrice,
          data: data,
        };
      }

      res.status(200).json({
        status: 'success',
        results: newMainDoc.length,
        currentPage: page,
        totalPages: Math.ceil(mainDocs.length / perPage),
        data: data,
      });
    });
  }
}