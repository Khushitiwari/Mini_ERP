const express = require('express');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { validate, purchaseOrderSchema } = require('../utils/validators');
const { ROLES, ROLE_GROUPS } = require('../utils/constants');

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

module.exports = router;
