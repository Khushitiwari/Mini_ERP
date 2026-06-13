const prisma = require('../config/db');
const purchaseService = require('../services/purchaseService');
const { successResponse } = require('../utils/apiResponse');
const { createAuditLog } = require('../middleware/auditLogger');

const getPurchaseOrders = async (req, res, next) => {
  try {
    const { status, vendorId } = req.query;
    const where = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = parseInt(vendorId, 10);

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        items: { include: { product: true } },
        vendor: true,
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: { orderDate: 'desc' },
    });

    return successResponse(res, orders, 'Purchase orders retrieved');
  } catch (err) {
    next(err);
  }
};

const getPurchaseOrderById = async (req, res, next) => {
  try {
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        items: { include: { product: true } },
        vendor: true,
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return next(Object.assign(new Error('Purchase order not found'), { statusCode: 404 }));
    }

    return successResponse(res, order, 'Purchase order retrieved');
  } catch (err) {
    next(err);
  }
};

const createPurchaseOrder = async (req, res, next) => {
  try {
    const { vendorId, items } = req.body;
    const order = await purchaseService.createPurchaseOrder(vendorId, items, req.user.id);

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'PurchaseOrder',
      entityId: order.id,
      newValue: order,
    });

    return successResponse(res, order, 'Purchase order created', 201);
  } catch (err) {
    next(err);
  }
};

const confirmPurchaseOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    const order = await purchaseService.confirmPurchaseOrder(orderId);

    await createAuditLog({
      userId: req.user.id,
      action: 'CONFIRM',
      entityType: 'PurchaseOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Purchase order confirmed');
  } catch (err) {
    next(err);
  }
};

const receivePurchaseOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { items } = req.body;
    const oldOrder = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    const order = await purchaseService.receivePurchaseOrder(orderId, items);

    await createAuditLog({
      userId: req.user.id,
      action: 'RECEIVE',
      entityType: 'PurchaseOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Purchase order receipt recorded');
  } catch (err) {
    next(err);
  }
};

const cancelPurchaseOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    const order = await purchaseService.cancelPurchaseOrder(orderId);

    await createAuditLog({
      userId: req.user.id,
      action: 'CANCEL',
      entityType: 'PurchaseOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Purchase order cancelled');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  confirmPurchaseOrder,
  receivePurchaseOrder,
  cancelPurchaseOrder,
};
