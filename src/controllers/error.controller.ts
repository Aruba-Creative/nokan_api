import { Request, Response, NextFunction } from 'express';
import AppError from '@/utils/app-error';

interface IError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  path?: string;
  value?: string;
  errors?: { [key: string]: { message: string } };
  errmsg?: string;
  name: string;
}

const handleCastErrorDB = (err: IError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err: IError): AppError => {
  if (err.errmsg && typeof err.errmsg === 'string') {
    const match = err.errmsg.match(/(["'])(\\?.)*?\1/);
    const value = match ? match[0] : '';
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
  } else {
    // Handle other cases or return a generic error
    return new AppError(
      'Duplicate field value. Please use another value!',
      400
    );
  }
};

const handleValidationErrorDB = (err: IError): AppError => {
  if (err.errors) {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
  }
  return new AppError('Validation error occurred', 400);
};

const handleJWTError = (): AppError =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = (): AppError =>
  new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err: IError, req: Request, res: Response): void => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode || 500).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return;
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  res.status(err.statusCode || 500).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err: IError, req: Request, res: Response): void => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        status: err.status,
        message: err.message,
      });
      return;
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) Log error
    console.error('ERROR 💥', err);
    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
    return;
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode || 500).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
    return;
  }
  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR 💥', err);
  // 2) Send generic message
  res.status(err.statusCode || 500).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

export default (
  err: IError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};