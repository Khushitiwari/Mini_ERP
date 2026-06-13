import prisma from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getCustomers = async (req, res, next) => {
  try {
    const customers = await prisma.customer.findMany({ orderBy: { name: 'asc' } });
    return successResponse(res, customers, 'Customers retrieved');
  } catch (err) {
    next(err);
  }
};

export const getCustomerById = async (req, res, next) => {
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

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await prisma.customer.create({ data: req.body });

    await logAudit(req.user.id, 'CREATE', 'Customer', customer.id, null, customer);

    return successResponse(res, customer, 'Customer created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!oldCustomer) {
      return next(Object.assign(new Error('Customer not found'), { statusCode: 404 }));
    }

    const customer = await prisma.customer.update({ where: { id }, data: req.body });

    await logAudit(req.user.id, 'UPDATE', 'Customer', customer.id, oldCustomer, customer);

    return successResponse(res, customer, 'Customer updated');
  } catch (err) {
    next(err);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!oldCustomer) {
      return next(Object.assign(new Error('Customer not found'), { statusCode: 404 }));
    }

    await prisma.customer.delete({ where: { id } });

    await logAudit(req.user.id, 'DELETE', 'Customer', id, oldCustomer, null);

    return successResponse(res, null, 'Customer deleted');
  } catch (err) {
    next(err);
  }
};
