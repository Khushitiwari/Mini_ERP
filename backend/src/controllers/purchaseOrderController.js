import prisma from '../config/db.js';
import * as purchaseService from '../services/purchaseService.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getPurchaseOrders = async (req, res, next) => {
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

export const getPurchaseOrderById = async (req, res, next) => {
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

export const createPurchaseOrder = async (req, res, next) => {
  try {
    const { vendorId, items } = req.body;
    const order = await purchaseService.createPurchaseOrder(vendorId, items, req.user.id);

    await logAudit(req.user.id, 'CREATE_PURCHASE_ORDER', 'PurchaseOrder', order.id, null, order);

    return successResponse(res, order, 'Purchase order created', 201);
  } catch (err) {
    next(err);
  }
};

export const confirmPurchaseOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    const order = await purchaseService.confirmPurchaseOrder(orderId);

    await logAudit(req.user.id, 'CONFIRM_PURCHASE_ORDER', 'PurchaseOrder', order.id, oldOrder, order);

    return successResponse(res, order, 'Purchase order confirmed');
  } catch (err) {
    next(err);
  }
};

export const receivePurchaseOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const { items } = req.body;
    const oldOrder = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    const order = await purchaseService.receivePurchaseOrder(orderId, items, req.user.id);

    await logAudit(req.user.id, 'RECEIVE_PURCHASE_ORDER', 'PurchaseOrder', order.id, oldOrder, order);

    return successResponse(res, order, 'Purchase order receipt recorded');
  } catch (err) {
    next(err);
  }
};

export const cancelPurchaseOrder = async (req, res, next) => {
  try {
    const orderId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.purchaseOrder.findUnique({ where: { id: orderId } });
    const order = await purchaseService.cancelPurchaseOrder(orderId);

    await logAudit(req.user.id, 'CANCEL_PURCHASE_ORDER', 'PurchaseOrder', order.id, oldOrder, order);

    return successResponse(res, order, 'Purchase order cancelled');
  } catch (err) {
    next(err);
  }
};
