import express from 'express';
import authController from '@/controllers/auth.controller';
import { authRateLimiter } from '@/middlewares';

const router = express.Router();

// Apply rate limiting to auth routes
router.use(authRateLimiter);

// Authentication routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);

export default router;