import userController from '../controllers/user-controller.js';
import { body } from 'express-validator';
import { Router } from 'express';
import authMiddleware from '../middlewares/auth-middleware.js';
import validationMiddleware from '../middlewares/validation-middleware.js';

const router = Router();

// registration
router.post(
  '/register',
  body('email').isEmail().bail(),
  body('username')
    .notEmpty()
    .bail()
    // numbers and letters only
    .matches(/^[0-9a-zA-Z]+$/)
    .bail(),
  body('password').isLength({ min: 8 }).bail().matches(/\d/).bail().matches(/[A-Z]/).bail(),
  validationMiddleware,
  userController.register
);

// login
router.post(
  '/login',
  body('username').notEmpty().bail(),
  body('password').notEmpty().bail(),
  validationMiddleware,
  userController.login
);

// users profile data editing
router.post(
  '/edit',
  authMiddleware,
  body('displayedName').if(body('displayedName').exists()).isLength({ max: 255 }).bail(),
  body('about').if(body('about').exists()).isLength({ max: 255 }).bail(),
  body('youtube').if(body('youtube').exists()).isLength({ max: 255 }).bail(),
  body('vk').if(body('vk').exists()).isLength({ max: 255 }).bail(),
  body('instagram').if(body('instagram').exists()).isLength({ max: 255 }).bail(),
  validationMiddleware,
  userController.edit
);

// logout
router.post('/logout', userController.logout);

// email activation
router.get('/activate/:activationLink', userController.activate);

// refresh tokens
router.get('/refresh', userController.refresh);

export default router;
