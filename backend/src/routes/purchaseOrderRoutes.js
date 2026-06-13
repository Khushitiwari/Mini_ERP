import express from 'express';
import * as purchaseOrderController from '../controllers/purchaseOrderController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate, purchaseOrderSchema } from '../utils/validators.js';
import { ROLES, ROLE_GROUPS } from '../utils/constants.js';

const router = express.Router();
const fullAccess = [...ROLE_GROUPS.PURCHASE_FULL];
const readAccess = [
  ...fullAccess,
  ROLES.SALES,
  ROLES.MANUFACTURING,
  ROLES.INVENTORY_MANAGER,
  ROLES.OWNER,
];

router.use(authMiddleware);

router.get('/', allowRoles(...readAccess), purchaseOrderController.getPurchaseOrders);
router.get('/:id', allowRoles(...readAccess), purchaseOrderController.getPurchaseOrderById);
router.post('/', allowRoles(...fullAccess), validate(purchaseOrderSchema), purchaseOrderController.createPurchaseOrder);
router.put('/:id/confirm', allowRoles(...fullAccess), purchaseOrderController.confirmPurchaseOrder);
router.put('/:id/receive', allowRoles(...fullAccess), purchaseOrderController.receivePurchaseOrder);
router.put('/:id/cancel', allowRoles(...fullAccess), purchaseOrderController.cancelPurchaseOrder);

export default router;
