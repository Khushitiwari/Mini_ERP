import express from 'express';
import * as productController from '../controllers/productController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { validate, productSchema } from '../utils/validators.js';
import { ROLE_GROUPS } from '../utils/constants.js';

const router = express.Router();
const fullAccess = [...ROLE_GROUPS.PRODUCT_FULL];
const readAccess = [...fullAccess, ...ROLE_GROUPS.PRODUCT_READ];

router.use(authMiddleware);

router.get('/', allowRoles(...readAccess), productController.getProducts);
router.get('/:id', allowRoles(...readAccess), productController.getProductById);
router.post('/', allowRoles(...fullAccess), validate(productSchema), productController.createProduct);
router.put('/:id', allowRoles(...fullAccess), productController.updateProduct);
router.delete('/:id', allowRoles(...fullAccess), productController.deleteProduct);

export default router;
