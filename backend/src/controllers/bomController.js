import prisma from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';

const bomIncludes = {
  finishedProduct: { select: { id: true, name: true } },
  components: {
    include: {
      componentProduct: {
        select: { id: true, name: true, onHandQty: true, reservedQty: true, type: true },
      },
    },
  },
  operations: true,
};

export const getAllBoms = async (req, res, next) => {
  try {
    const boms = await prisma.boM.findMany({
      include: bomIncludes,
      orderBy: { id: 'asc' },
    });

    return successResponse(res, boms, 'BoMs retrieved');
  } catch (err) {
    next(err);
  }
};

export const getBomByProductId = async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const bom = await prisma.boM.findFirst({
      where: { finishedProductId: productId },
      include: {
        finishedProduct: true,
        components: {
          include: {
            componentProduct: {
              select: { id: true, name: true, onHandQty: true, reservedQty: true, type: true },
            },
          },
        },
        operations: true,
      },
    });

    if (!bom) {
      return next(
        Object.assign(new Error('No BoM found for this product'), { statusCode: 404 })
      );
    }

    return successResponse(res, bom, 'BoM retrieved');
  } catch (err) {
    next(err);
  }
};

export const createBom = async (req, res, next) => {
  try {
    const { finishedProductId, components, operations = [] } = req.body;
    const productId = Number(finishedProductId);

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return next(Object.assign(new Error('Finished product not found'), { statusCode: 404 }));
    }

    const existing = await prisma.boM.findUnique({ where: { finishedProductId: productId } });
    if (existing) {
      return next(
        Object.assign(new Error('BoM already exists for this product'), { statusCode: 400 })
      );
    }

    const bom = await prisma.boM.create({
      data: {
        finishedProductId: productId,
        components: {
          create: components.map((c) => ({
            componentProductId: Number(c.componentProductId),
            quantityRequired: Number(c.quantityRequired),
          })),
        },
        operations: {
          create: operations.map((o) => ({
            operationName: o.operationName,
            durationMinutes: Number(o.durationMinutes),
            workCenter: o.workCenter,
          })),
        },
      },
      include: {
        finishedProduct: { select: { id: true, name: true } },
        components: {
          include: {
            componentProduct: {
              select: { id: true, name: true, onHandQty: true, reservedQty: true, type: true },
            },
          },
        },
        operations: true,
      },
    });

    await logAudit(req.user.id, 'CREATE_BOM', 'BoM', bom.id, null, bom);

    return successResponse(res, bom, 'BoM created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateBom = async (req, res, next) => {
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
          componentProductId: Number(c.componentProductId),
          quantityRequired: Number(c.quantityRequired),
        })),
      });
    }

    if (operations) {
      await prisma.boMOperation.deleteMany({ where: { bomId: id } });
      await prisma.boMOperation.createMany({
        data: operations.map((o) => ({
          bomId: id,
          operationName: o.operationName,
          durationMinutes: Number(o.durationMinutes),
          workCenter: o.workCenter,
        })),
      });
    }

    const bom = await prisma.boM.findUnique({
      where: { id },
      include: bomIncludes,
    });

    await logAudit(req.user.id, 'UPDATE_BOM', 'BoM', bom.id, oldBom, bom);

    return successResponse(res, bom, 'BoM updated');
  } catch (err) {
    next(err);
  }
};
