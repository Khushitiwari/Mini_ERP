import express from 'express';
import * as vendorController from '../controllers/vendorController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate, vendorSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', vendorController.getVendors);
router.get('/:id', vendorController.getVendorById);
router.post('/', validate(vendorSchema), vendorController.createVendor);
router.put('/:id', validate(vendorSchema), vendorController.updateVendor);
router.delete('/:id', vendorController.deleteVendor);

export default router;
