const express = require('express');
const bomController = require('../controllers/bomController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { validate, bomSchema } = require('../utils/validators');
const { ROLES, ROLE_GROUPS } = require('../utils/constants');

const router = express.Router();
const fullAccess = [...ROLE_GROUPS.BOM_FULL, ROLES.OWNER];
const readAccess = [
  ROLES.ADMIN,
  ROLES.MANUFACTURING,
  ROLES.SALES,
  ROLES.PURCHASE,
  ROLES.INVENTORY_MANAGER,
  ROLES.OWNER,
];

router.use(authMiddleware);

router.get('/:productId', allowRoles(...readAccess), bomController.getBomByProductId);
router.post('/', allowRoles(...fullAccess), validate(bomSchema), bomController.createBom);
router.put('/:id', allowRoles(...fullAccess), bomController.updateBom);

module.exports = router;
