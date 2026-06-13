import express from 'express';
import * as customerController from '../controllers/customerController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate, customerSchema } from '../utils/validators.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', validate(customerSchema), customerController.createCustomer);
router.put('/:id', validate(customerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

export default router;
