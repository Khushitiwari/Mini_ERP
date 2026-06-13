const prisma = require('../config/db');
const manufacturingService = require('../services/manufacturingService');
const { successResponse } = require('../utils/apiResponse');
const { createAuditLog } = require('../middleware/auditLogger');

const getManufacturingOrders = async (req, res, next) => {
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

const getManufacturingOrderById = async (req, res, next) => {
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

const createManufacturingOrder = async (req, res, next) => {
  try {
    const { productId, quantity, assignedTo } = req.body;
    const order = await manufacturingService.createManufacturingOrder(
      productId,
      quantity,
      assignedTo || req.user.id
    );

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'ManufacturingOrder',
      entityId: order.id,
      newValue: order,
    });

    return successResponse(res, order, 'Manufacturing order created', 201);
  } catch (err) {
    next(err);
  }
};

const startManufacturingOrder = async (req, res, next) => {
  try {
    const moId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.manufacturingOrder.findUnique({ where: { id: moId } });
    const order = await manufacturingService.startManufacturingOrder(moId);

    await createAuditLog({
      userId: req.user.id,
      action: 'START',
      entityType: 'ManufacturingOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Manufacturing order started');
  } catch (err) {
    next(err);
  }
};

const completeWorkOrder = async (req, res, next) => {
  try {
    const moId = parseInt(req.params.id, 10);
    const woId = parseInt(req.params.woId, 10);
    const order = await manufacturingService.completeWorkOrder(moId, woId);

    await createAuditLog({
      userId: req.user.id,
      action: 'COMPLETE_WORK_ORDER',
      entityType: 'WorkOrder',
      entityId: woId,
      newValue: { manufacturingOrderId: moId, workOrderId: woId },
    });

    return successResponse(res, order, 'Work order completed');
  } catch (err) {
    next(err);
  }
};

const completeManufacturingOrder = async (req, res, next) => {
  try {
    const moId = parseInt(req.params.id, 10);
    const oldOrder = await prisma.manufacturingOrder.findUnique({ where: { id: moId } });
    const order = await manufacturingService.completeManufacturingOrder(moId);

    await createAuditLog({
      userId: req.user.id,
      action: 'COMPLETE',
      entityType: 'ManufacturingOrder',
      entityId: order.id,
      oldValue: oldOrder,
      newValue: order,
    });

    return successResponse(res, order, 'Manufacturing order completed');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getManufacturingOrders,
  getManufacturingOrderById,
  createManufacturingOrder,
  startManufacturingOrder,
  completeWorkOrder,
  completeManufacturingOrder,
};
