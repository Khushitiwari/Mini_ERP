const express = require('express');
const vendorController = require('../controllers/vendorController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, vendorSchema } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.post('/', validate(vendorSchema), vendorController.createVendor);
router.put('/:id', validate(vendorSchema), vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

module.exports = router;
