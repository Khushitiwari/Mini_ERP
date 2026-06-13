import prisma from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';
import { logAudit } from '../middleware/auditLogger.js';
import * as stockService from '../services/stockService.js';

export const getProducts = async (req, res, next) => {
  try {
    const { type, procurementStrategy } = req.query;
    const where = {};
    if (type) where.type = type;
    if (procurementStrategy) where.procurementStrategy = procurementStrategy;

    const products = await prisma.product.findMany({
      where,
      include: { defaultVendor: true },
      orderBy: { name: 'asc' },
    });

    return successResponse(res, products, 'Products retrieved');
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id, 10) },
      include: { defaultVendor: true, bomAsFinished: { include: { components: true, operations: true } } },
    });

    if (!product) {
      return next(Object.assign(new Error('Product not found'), { statusCode: 404 }));
    }

    return successResponse(res, product, 'Product retrieved');
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const initialQty = data.onHandQty || 0;
    delete data.onHandQty;

    const product = await prisma.product.create({
      data,
      include: { defaultVendor: true },
    });

    if (initialQty > 0) {
      await stockService.updateStock(product.id, initialQty, 'MANUAL_ADJUSTMENT', null, null, req.user.id);
    }

    const result = await prisma.product.findUnique({
      where: { id: product.id },
      include: { defaultVendor: true },
    });

    await logAudit(req.user.id, 'CREATE_PRODUCT', 'Product', result.id, null, result);

    return successResponse(res, result, 'Product created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (!oldProduct) {
      return next(Object.assign(new Error('Product not found'), { statusCode: 404 }));
    }

    const data = { ...req.body };
    delete data.onHandQty;
    delete data.reservedQty;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { defaultVendor: true },
    });

    await logAudit(req.user.id, 'UPDATE_PRODUCT', 'Product', product.id, oldProduct, product);

    return successResponse(res, product, 'Product updated');
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (!oldProduct) {
      return next(Object.assign(new Error('Product not found'), { statusCode: 404 }));
    }

    await prisma.product.delete({ where: { id } });

    await logAudit(req.user.id, 'DELETE_PRODUCT', 'Product', id, oldProduct, null);

    return successResponse(res, null, 'Product deleted');
  } catch (err) {
    next(err);
  }
};
