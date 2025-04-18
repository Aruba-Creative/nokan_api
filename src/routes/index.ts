import express, { Router } from 'express';
import userRoutes from './user.routes';
import roleRoutes from './role.routes';
import permissionRoutes from './permission.routes';
import authRoutes from './auth.routes'; 
import projectRoutes from './project.routes'; 
import linkRoutes from './link.routes'; 

const router: Router = express.Router();

// Define API routes
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/permissions', permissionRoutes);
router.use('/auth', authRoutes); 
router.use('/projects', projectRoutes); 
router.use('/links', linkRoutes); 

export default router;