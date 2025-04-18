import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import AppError from './app-error';

// Create upload directories if they don't exist
const createDirs = () => {
  const uploadsDir = path.join(__dirname, '../../public/uploads');
  const imagesDir = path.join(uploadsDir, 'images');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }
};

// Create directories on module import
createDirs();

// Configure storage
interface StorageDestinationCallback {
    (error: Error | null, destination: string): void;
}

interface StorageFilenameCallback {
    (error: Error | null, filename: string): void;
}

const storage = multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: StorageDestinationCallback) => {
        cb(null, path.join(__dirname, '../../public/uploads/images'));
    },
    filename: (req: Request, file: Express.Multer.File, cb: StorageFilenameCallback) => {
        // Generate a unique filename with original extension
        const uniqueSuffix = uuidv4();
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// File filter function to check file types
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedFileTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Create multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Get file URL from filename
export const getFileUrl = (filename: string): string => {
  return `/uploads/images/${filename}`;
};

// Delete file from disk
export const deleteFile = (fileUrl: string): void => {
  try {
    // Extract the filename from the URL
    const filename = fileUrl.split('/').pop();
    if (!filename) return;
    
    const filePath = path.join(__dirname, '../../public/uploads/images', filename);
    
    // Check if file exists before deleting
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default upload;