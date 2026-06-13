import prisma from '../config/db.js';
import * as manufacturingService from '../services/manufacturingService.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getManufacturingOrders = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const orders = await prisma.manufacturingOrder.findMany({
      where,
      include: {
        product: true,
        bom: { include: { components: { include: { componentProduct: true } }, operations: true } },
        workOrders: true,
        assigned: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, orders, 'Manufacturing orders retrieved');
  } catch (err) {
    next(err);
  }
};

export const getManufacturingOrderById = async (req, res, next) => {
  try {
    const order = await prisma.manufacturingOrder.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: {
        product: true,
        bom: { include: { components: { include: { componentProduct: true } }, operations: true } },
        workOrders: true,
        assigned: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return next(Object.assign(new Error('Manufacturing order not found'), { statusCode: 404 }));
    }

    return successResponse(res, order, 'Manufacturing order retrieved');
  } catch (err) {
    next(err);
  }
};

export const createManufacturingOrder = async (req, res, next) => {
  try {
    const { productId, quantity, assignedTo } = req.body;
    const order = await manufacturingService.createManufacturingOrder(
      productId,
      quantity,
      assignedTo || req.user.id
    );

    await logAudit(req.user.id, 'CREATE_MANUFACTURING_ORDER', 'ManufacturingOrder', order.id, null, order);

    return successResponse(res, order, 'Manufacturing order created', 201);
  } catch (err) {
    next(err);
  }
};

export const startManufacturingOrder = async (req, res, next) => {
  try {
    const moId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.manufacturingOrder.findUnique({ where: { id: moId } });
    const order = await manufacturingService.startManufacturingOrder(moId);

    await logAudit(req.user.id, 'START_MANUFACTURING_ORDER', 'ManufacturingOrder', order.id, oldOrder, order);

    return successResponse(res, order, 'Manufacturing order started');
  } catch (err) {
    next(err);
  }
};

export const completeWorkOrder = async (req, res, next) => {
  try {
    const moId = parseInt(req.params.id, 10);
    const woId = parseInt(req.params.woId, 10);
    const order = await manufacturingService.completeWorkOrder(moId, woId);

    await logAudit(req.user.id, 'COMPLETE_WORK_ORDER', 'WorkOrder', woId, null, {
      manufacturingOrderId: moId,
      workOrderId: woId,
    });

    return successResponse(res, order, 'Work order completed');
  } catch (err) {
    next(err);
  }
};

export const completeManufacturingOrder = async (req, res, next) => {
  try {
    const moId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.manufacturingOrder.findUnique({ where: { id: moId } });
    const order = await manufacturingService.completeManufacturingOrder(moId, req.user.id);

    await logAudit(req.user.id, 'COMPLETE_MANUFACTURING_ORDER', 'ManufacturingOrder', order.id, oldOrder, order);

    return successResponse(res, order, 'Manufacturing order completed');
  } catch (err) {
    next(err);
  }
};

export const cancelManufacturingOrder = async (req, res, next) => {
  try {
    const moId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.manufacturingOrder.findUnique({ where: { id: moId } });
    const order = await manufacturingService.cancelManufacturingOrder(moId);

    await logAudit(req.user.id, 'CANCEL_MANUFACTURING_ORDER', 'ManufacturingOrder', order.id, oldOrder, order);

    return successResponse(res, order, 'Manufacturing order cancelled');
  } catch (err) {
    next(err);
  }
};
