const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');
const { createAuditLog } = require('../middleware/auditLogger');

const getBomByProductId = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const bom = await prisma.boM.findUnique({
      where: { finishedProductId: productId },
      include: {
        finishedProduct: true,
        components: { include: { componentProduct: true } },
        operations: true,
      },
    });

    if (!bom) {
      return next(Object.assign(new Error('BoM not found for this product'), { statusCode: 404 }));
    }

    return successResponse(res, bom, 'BoM retrieved');
  } catch (err) {
    next(err);
  }
};

const createBom = async (req, res, next) => {
  try {
    const { finishedProductId, components, operations = [] } = req.body;

    const product = await prisma.product.findUnique({ where: { id: finishedProductId } });
    if (!product) {
      return next(Object.assign(new Error('Finished product not found'), { statusCode: 404 }));
    }

    const existing = await prisma.boM.findUnique({ where: { finishedProductId } });
    if (existing) {
      return next(Object.assign(new Error('BoM already exists for this product'), { statusCode: 400 }));
    }

    const bom = await prisma.boM.create({
      data: {
        finishedProductId,
        components: {
          create: components.map((c) => ({
            componentProductId: c.componentProductId,
            quantityRequired: c.quantityRequired,
          })),
        },
        operations: {
          create: operations.map((o) => ({
            operationName: o.operationName,
            durationMinutes: o.durationMinutes,
            workCenter: o.workCenter,
          })),
        },
      },
      include: {
        finishedProduct: true,
        components: { include: { componentProduct: true } },
        operations: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'BoM',
      entityId: bom.id,
      newValue: bom,
    });

    return successResponse(res, bom, 'BoM created', 201);
  } catch (err) {
    next(err);
  }
};

const updateBom = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldBom = await prisma.boM.findUnique({
      where: { id },
      include: { components: true, operations: true },
    });

    if (!oldBom) {
      return next(Object.assign(new Error('BoM not found'), { statusCode: 404 }));
    }

    const { components, operations } = req.body;

    if (components) {
      await prisma.boMComponent.deleteMany({ where: { bomId: id } });
      await prisma.boMComponent.createMany({
        data: components.map((c) => ({
          bomId: id,
          componentProductId: c.componentProductId,
          quantityRequired: c.quantityRequired,
        })),
      });
    }

    if (operations) {
      await prisma.boMOperation.deleteMany({ where: { bomId: id } });
      await prisma.boMOperation.createMany({
        data: operations.map((o) => ({
          bomId: id,
          operationName: o.operationName,
          durationMinutes: o.durationMinutes,
          workCenter: o.workCenter,
        })),
      });
    }

    const bom = await prisma.boM.findUnique({
      where: { id },
      include: {
        finishedProduct: true,
        components: { include: { componentProduct: true } },
        operations: true,
      },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'BoM',
      entityId: bom.id,
      oldValue: oldBom,
      newValue: bom,
    });

    return successResponse(res, bom, 'BoM updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { getBomByProductId, createBom, updateBom };
