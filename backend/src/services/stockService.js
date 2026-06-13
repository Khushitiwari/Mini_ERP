const prisma = require('../config/db');
const { logAudit } = require('../middleware/auditLogger');

/**
 * Central stock module — the ONLY place that changes onHandQty.
 */
const updateStock = async (
  productId,
  changeQty,
  reason,
  referenceId = null,
  referenceType = null,
  userId = null
) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  const previousQty = product.onHandQty;
  const newOnHandQty = previousQty + changeQty;
  if (newOnHandQty < 0) {
    throw Object.assign(new Error(`Insufficient stock for product ${product.name}`), { statusCode: 400 });
  }

  const [updatedProduct, ledgerEntry] = await prisma.$transaction([
    prisma.product.update({
      where: { id: productId },
      data: { onHandQty: newOnHandQty },
    }),
    prisma.stockLedger.create({
      data: {
        productId,
        changeQty,
        reason,
        referenceId,
        referenceType,
      },
    }),
  ]);

  if (userId) {
    await logAudit(
      userId,
      'STOCK_UPDATE',
      'Product',
      productId,
      { onHandQty: previousQty },
      { onHandQty: newOnHandQty, changeQty, reason }
    );
  }

  return { product: updatedProduct, ledgerEntry };
};

const getFreeToUseQty = async (productId) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }
  return product.onHandQty - product.reservedQty;
};

const reserveStock = async (productId, qty) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  const freeQty = product.onHandQty - product.reservedQty;
  if (freeQty < qty) {
    throw Object.assign(
      new Error(`Cannot reserve ${qty} units of ${product.name}. Free to use: ${freeQty}`),
      { statusCode: 400 }
    );
  }

  return prisma.product.update({
    where: { id: productId },
    data: { reservedQty: product.reservedQty + qty },
  });
};

const releaseReservedStock = async (productId, qty) => {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  const newReserved = Math.max(0, product.reservedQty - qty);

  return prisma.product.update({
    where: { id: productId },
    data: { reservedQty: newReserved },
  });
};

const getStockSummary = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      sku: true,
      type: true,
      onHandQty: true,
      reservedQty: true,
    },
  });

  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  return {
    ...product,
    freeToUseQty: product.onHandQty - product.reservedQty,
  };
};

const getAllStockSummary = async () => {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      type: true,
      onHandQty: true,
      reservedQty: true,
    },
    orderBy: { name: 'asc' },
  });

  return products.map((p) => ({
    ...p,
    freeToUseQty: p.onHandQty - p.reservedQty,
  }));
};

const getStockLedger = async (productId) => {
  return prisma.stockLedger.findMany({
    where: { productId },
    orderBy: { timestamp: 'desc' },
  });
};

module.exports = {
  updateStock,
  getFreeToUseQty,
  reserveStock,
  releaseReservedStock,
  getStockSummary,
  getAllStockSummary,
  getStockLedger,
};
