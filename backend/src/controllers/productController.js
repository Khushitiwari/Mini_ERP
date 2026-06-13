const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');
const { createAuditLog } = require('../middleware/auditLogger');

const getProducts = async (req, res, next) => {
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

const getProductById = async (req, res, next) => {
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

const createProduct = async (req, res, next) => {
  try {
    const data = { ...req.body };
    const initialQty = data.onHandQty || 0;
    delete data.onHandQty;

    const product = await prisma.product.create({
      data,
      include: { defaultVendor: true },
    });

    if (initialQty > 0) {
      const stockService = require('../services/stockService');
      await stockService.updateStock(product.id, initialQty, 'MANUAL_ADJUSTMENT', null, null);
    }

    const result = await prisma.product.findUnique({
      where: { id: product.id },
      include: { defaultVendor: true },
    });

    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE',
      entityType: 'Product',
      entityId: result.id,
      newValue: result,
    });

    return successResponse(res, result, 'Product created', 201);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
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

    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE',
      entityType: 'Product',
      entityId: product.id,
      oldValue: oldProduct,
      newValue: product,
    });

    return successResponse(res, product, 'Product updated');
  } catch (err) {
    next(err);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (!oldProduct) {
      return next(Object.assign(new Error('Product not found'), { statusCode: 404 }));
    }

    await prisma.product.delete({ where: { id } });

    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE',
      entityType: 'Product',
      entityId: id,
      oldValue: oldProduct,
    });

    return successResponse(res, null, 'Product deleted');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
