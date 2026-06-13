import express from 'express';
import * as stockController from '../controllers/stockController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { ROLES, ROLE_GROUPS } from '../utils/constants.js';

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

export default router;
