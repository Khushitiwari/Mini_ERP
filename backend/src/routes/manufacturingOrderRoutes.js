const express = require('express');
const manufacturingOrderController = require('../controllers/manufacturingOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { validate, manufacturingOrderSchema } = require('../utils/validators');
const { ROLES, ROLE_GROUPS } = require('../utils/constants');

const router = express.Router();
const fullAccess = [...ROLE_GROUPS.MANUFACTURING_FULL];
const readAccess = [
  ...fullAccess,
  ROLES.SALES,
  ROLES.PURCHASE,
  ROLES.INVENTORY_MANAGER,
  ROLES.OWNER,
];

router.use(authMiddleware);

router.get('/', allowRoles(...readAccess), manufacturingOrderController.getManufacturingOrders);
router.get('/:id', allowRoles(...readAccess), manufacturingOrderController.getManufacturingOrderById);
router.post('/', allowRoles(...fullAccess), validate(manufacturingOrderSchema), manufacturingOrderController.createManufacturingOrder);
router.put('/:id/start', allowRoles(...fullAccess), manufacturingOrderController.startManufacturingOrder);
router.put('/:id/work-orders/:woId/complete', allowRoles(...fullAccess), manufacturingOrderController.completeWorkOrder);
router.put('/:id/complete', allowRoles(...fullAccess), manufacturingOrderController.completeManufacturingOrder);
router.put('/:id/cancel', allowRoles(...fullAccess), manufacturingOrderController.cancelManufacturingOrder);

module.exports = router;
