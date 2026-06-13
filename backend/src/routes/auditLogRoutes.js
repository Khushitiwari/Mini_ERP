import express from 'express';
import * as auditLogController from '../controllers/auditLogController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authMiddleware);
router.get('/', allowRoles(ROLES.ADMIN), auditLogController.getAuditLogs);

export default router;
