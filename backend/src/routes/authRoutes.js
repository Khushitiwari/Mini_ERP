import express from 'express';
import * as authController from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate, createUserSchema, loginSchema, updateUserRoleSchema } from '../utils/validators.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', authMiddleware, authController.getMe);

router.post(
  '/users',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  validate(createUserSchema),
  authController.createUser
);
router.get('/users', authMiddleware, allowRoles(ROLES.ADMIN), authController.getAllUsers);
router.put(
  '/users/:id/role',
  authMiddleware,
  allowRoles(ROLES.ADMIN),
  validate(updateUserRoleSchema),
  authController.updateUserRole
);
router.delete('/users/:id', authMiddleware, allowRoles(ROLES.ADMIN), authController.deleteUser);

export default router;
