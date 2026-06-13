import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate, registerSchema, loginSchema } from '../utils/validators.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.me);
router.post(
  '/register',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  validate(registerSchema),
  authController.register
);

export default router;
