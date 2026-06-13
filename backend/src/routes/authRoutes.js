const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { validate, registerSchema, loginSchema } = require('../utils/validators');
const { ROLES } = require('../utils/constants');

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

module.exports = router;
