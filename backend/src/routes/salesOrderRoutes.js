import express from 'express';
import * as salesOrderController from '../controllers/salesOrderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate, salesOrderSchema } from '../utils/validators.js';
import { ROLES, ROLE_GROUPS } from '../utils/constants.js';

const router = express.Router();
const fullAccess = [...ROLE_GROUPS.SALES_FULL];
const readAccess = [
  ...fullAccess,
  ROLES.PURCHASE,
  ROLES.MANUFACTURING,
  ROLES.INVENTORY_MANAGER,
  ROLES.OWNER,
];

router.use(authMiddleware);

router.get('/', allowRoles(...readAccess), salesOrderController.getSalesOrders);
router.get('/:id', allowRoles(...readAccess), salesOrderController.getSalesOrderById);
router.post('/', allowRoles(...fullAccess), validate(salesOrderSchema), salesOrderController.createSalesOrder);
router.put('/:id/confirm', allowRoles(...fullAccess), salesOrderController.confirmSalesOrder);
router.put('/:id/deliver', allowRoles(...fullAccess), salesOrderController.deliverSalesOrder);
router.put('/:id/cancel', allowRoles(...fullAccess), salesOrderController.cancelSalesOrder);

export default router;
