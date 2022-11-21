import beatController from '../controllers/beat-controller.js';
import authMiddleware from '../middlewares/auth-middleware.js';
import { body, param } from 'express-validator';
import { Router } from 'express';
import activatedMiddleware from '../middlewares/activated-middleware.js';
const router = Router();

router.post(
  '/upload',
  authMiddleware,
  activatedMiddleware,
  // name required, 255 characters max
  body('name').notEmpty().bail().isLength({ max: 255 }).bail(),
  // wavePrice required, numeric
  body('wavePrice').notEmpty().bail().isDecimal().bail(),
  // stemsPrice numeric
  body('stemsPrice').if(body('stemsPrice').exists()).isDecimal().bail(),
  // bpm numeric
  body('bpm').if(body('bpm').exists()).isDecimal().bail(),
  // description 255 characters max
  body('description')
    .if(body('description').exists())
    .isLength({ max: 255 })
    .bail(),
  beatController.upload
);
router.get(
  '/',
  body('viewed').if(body('viewed').exists()).isDecimal().bail(),
  beatController.getBeats
);
router.get(
  '/:id',
  param('id').isDecimal().bail(),
  beatController.getIndividualBeat
);
router.post(
  '/:id/comment',
  authMiddleware,
  activatedMiddleware,
  param('id').isDecimal().bail(),
  body('content').notEmpty().isLength({ max: 255 }).bail(),
  beatController.comment
);

export default router;
