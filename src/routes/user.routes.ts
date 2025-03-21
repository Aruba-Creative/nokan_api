import express from 'express';
import userController from '@/controllers/user.controller';
import authController from '@/controllers/auth.controller';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(authController.protect);
router.patch('/updatePassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUserByID);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(
    authController.restrictTo('superAdmin'),
    userController.conditionForCreatingUser,
    userController.createNewUser
  );

router
  .route('/:id')
  .get(userController.getUserByID)
  .patch(
    userController.conditionsForUpdatngUserData,
    userController.updateCurrentUserData
  )
  .delete(
    authController.restrictTo('superAdmin'),
    userController.deleteCurrentUser
  );

export default router;