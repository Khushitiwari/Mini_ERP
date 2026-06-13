const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');
const { createAuditLog } = require('../middleware/auditLogger');

const getCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
    return successResponse(res, customers, 'Customers retrieved');
  } catch (err) {
    next(err);
  }
};

const getCustomerById = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { salesOrders: true },
    });

    if (!customer) {
      return next(Object.assign(new Error('Customer not found'), { statusCode: 404 }));
    }

    return successResponse(res, customer, 'Customer retrieved');
  } catch (err) {
    next(err);
  }
};

const createCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'Customer',
      entityId: customer.id,
      newValue: customer,
    });

    return successResponse(res, customer, 'Customer created', 201);
  } catch (err) {
    next(err);
  }
};

const updateCustomer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!oldCustomer) {
      return next(Object.assign(new Error('Customer not found'), { statusCode: 404 }));
    }

    const customer = await prisma.customer.update({ where: { id }, data: req.body });

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'Customer',
      entityId: customer.id,
      oldValue: oldCustomer,
      newValue: customer,
    });

    return successResponse(res, customer, 'Customer updated');
  } catch (err) {
    next(err);
  }
};

const deleteCustomer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!oldCustomer) {
      return next(Object.assign(new Error('Customer not found'), { statusCode: 404 }));
    }

    await prisma.customer.delete({ where: { id } });

    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE',
      entityType: 'Customer',
      entityId: id,
      oldValue: oldCustomer,
    });

    return successResponse(res, null, 'Customer deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
