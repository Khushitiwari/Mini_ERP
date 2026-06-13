const prisma = require('../config/db');
const salesService = require('../services/salesService');
const { successResponse } = require('../utils/apiResponse');
const { createAuditLog } = require('../middleware/auditLogger');

const getSalesOrders = async (req, res, next) => {
  try {
    const { status, customerId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (customerId) where.customerId = parseInt(customerId, 10);

    const orders = await prisma.salesOrder.findMany({
      where,
      include: {
        items: { include: { product: true } },
        customer: true,
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { orderDate: 'desc' },
    });

    return successResponse(res, orders, 'Sales orders retrieved');
  } catch (err) {
    next(err);
  }
};

const getSalesOrderById = async (req, res, next) => {
  try {
    const order = await prisma.salesOrder.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        items: { include: { product: true } },
        customer: true,
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return next(Object.assign(new Error('Sales order not found'), { statusCode: 404 }));
    }

    return successResponse(res, order, 'Sales order retrieved');
  } catch (err) {
    next(err);
  }
};

const createSalesOrder = async (req, res, next) => {
  try {
    const { customerId, items } = req.body;
    const order = await salesService.createSalesOrder(customerId, items, req.user.id);

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'SalesOrder',
      entityId: order.id,
      newValue: order,
    });

    return successResponse(res, order, 'Sales order created', 201);
  } catch (err) {
    next(err);
  }
};

const confirmSalesOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.salesOrder.findUnique({ where: { id: orderId } });
    const order = await salesService.confirmSalesOrder(orderId);

    await createAuditLog({
      userId: req.user.id,
      action: 'CONFIRM',
      entityType: 'SalesOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Sales order confirmed');
  } catch (err) {
    next(err);
  }
};

const deliverSalesOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { items } = req.body;
    const oldOrder = await prisma.salesOrder.findUnique({ where: { id: orderId } });
    const order = await salesService.deliverSalesOrder(orderId, items);

    await createAuditLog({
      userId: req.user.id,
      action: 'DELIVER',
      entityType: 'SalesOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Sales order delivery recorded');
  } catch (err) {
    next(err);
  }
};

const cancelSalesOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.salesOrder.findUnique({ where: { id: orderId } });
    const order = await salesService.cancelSalesOrder(orderId);

    await createAuditLog({
      userId: req.user.id,
      action: 'CANCEL',
      entityType: 'SalesOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Sales order cancelled');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  confirmSalesOrder,
  deliverSalesOrder,
  cancelSalesOrder,
};
