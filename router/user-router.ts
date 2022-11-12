import userController from '../controllers/user-controller';
import { body } from 'express-validator';
import { Router } from 'express';

const router = Router();

router.post(
  '/register',
  // data validators
  body('email').isEmail(),
  body('username')
    .notEmpty()
    .matches(/^[0-9a-zA-Z]+$/),
  body('password').isLength({ min: 8, max: 32 }),
  userController.register
);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:activationLink', userController.activate);
router.get('/refresh', userController.refresh);

export default router;
