import express from 'express';
import * as bomController from '../controllers/bomController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate, bomSchema } from '../utils/validators.js';
import { ROLES, ROLE_GROUPS } from '../utils/constants.js';

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

export default router;
