import express, { Router } from 'express';
import userRoutes from './user.routes';

const router: Router = express.Router();

// Define API routes
router.use('/users', userRoutes);

export default router;