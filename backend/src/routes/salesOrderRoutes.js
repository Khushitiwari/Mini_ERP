const express = require('express');
const salesOrderController = require('../controllers/salesOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { validate, salesOrderSchema } = require('../utils/validators');
const { ROLES, ROLE_GROUPS } = require('../utils/constants');

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

module.exports = router;
