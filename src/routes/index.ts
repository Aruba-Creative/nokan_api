import express, { Router } from 'express';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import permissionRoutes from './permission.routes';
import authRoutes from './auth.routes'; // Create this file if it doesn't exist

const router: Router = express.Router();

// Define API routes
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/auth', authRoutes); // Add this line to properly register auth routes

export default router;