const express = require('express');
const stockController = require('../controllers/stockController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { ROLES, ROLE_GROUPS } = require('../utils/constants');

const router = express.Router();
const fullAccess = [...ROLE_GROUPS.STOCK_FULL, ROLES.OWNER];
const readAccess = [
  ROLES.ADMIN,
  ROLES.INVENTORY_MANAGER,
  ROLES.SALES,
  ROLES.PURCHASE,
  ROLES.MANUFACTURING,
  ROLES.OWNER,
];

router.use(authMiddleware);

router.get('/', allowRoles(...readAccess), stockController.getAllStock);
router.get('/:productId/ledger', allowRoles(...readAccess), stockController.getStockLedger);
router.get('/:productId', allowRoles(...readAccess), stockController.getStockByProductId);
router.post('/:productId/adjust', allowRoles(...fullAccess), stockController.adjustStock);

module.exports = router;
