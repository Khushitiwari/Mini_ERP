const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const { allowRoles } = require('../middleware/roleMiddleware');
const { validate, productSchema } = require('../utils/validators');
const { ROLES, ROLE_GROUPS } = require('../utils/constants');

const router = express.Router();
const fullAccess = [...ROLE_GROUPS.PRODUCT_FULL];
const readAccess = [...fullAccess, ...ROLE_GROUPS.PRODUCT_READ];

router.use(authMiddleware);

router.get('/', allowRoles(...readAccess), productController.getProducts);
router.get('/:id', allowRoles(...readAccess), productController.getProductById);
router.post('/', allowRoles(...fullAccess), validate(productSchema), productController.createProduct);
router.put('/:id', allowRoles(...fullAccess), productController.updateProduct);
router.delete('/:id', allowRoles(...fullAccess), productController.deleteProduct);

module.exports = router;
