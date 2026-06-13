const express = require('express');
const customerController = require('../controllers/customerController');
const authMiddleware = require('../middleware/authMiddleware');
const { validate, customerSchema } = require('../utils/validators');

const router = express.Router();

router.use(authMiddleware);

router.get('/', customerController.getCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', validate(customerSchema), customerController.createCustomer);
router.put('/:id', validate(customerSchema), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
