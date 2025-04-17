import express from 'express';
import userController from '@/controllers/user.controller';
import authController from '@/controllers/auth.controller';
import { protect, hasPermission } from '@/middlewares';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(protect);
router.patch('/updatePassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUserByID);

router
  .route('/')
  .get(hasPermission('user:read'), userController.getAllUsers)
  .post(
    hasPermission('user:create'),
    userController.conditionForCreatingUser,
    userController.createNewUser
  );

router
  .route('/:id')
  .get(hasPermission('user:read'), userController.getUserByID)
  .patch(
    hasPermission('user:update'),
    userController.conditionsForUpdatngUserData,
    userController.updateCurrentUserData
  )
  .delete(
    hasPermission('user:delete'),
    userController.deleteCurrentUser
  );

export default router;