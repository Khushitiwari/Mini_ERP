const express = require('express');
const auditLogController = require('../controllers/auditLogController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.use(authMiddleware);
router.get('/', allowRoles(ROLES.ADMIN), auditLogController.getAuditLogs);

module.exports = router;
