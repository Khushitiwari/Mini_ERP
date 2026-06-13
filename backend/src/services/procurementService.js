const prisma = require('../config/db');

const triggerProcurement = async (productId, shortageQty, userId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { defaultVendor: true },
  });

  if (!product) {
    throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  if (!product.procurementType) {
    throw Object.assign(
      new Error(`No procurement type configured for product ${product.name}`),
      { statusCode: 400 }
    );
  }

  // Lazy requires to avoid circular dependencies
  const purchaseService = require('./purchaseService');
  const manufacturingService = require('./manufacturingService');

  if (product.procurementType === 'PURCHASE') {
    if (!product.defaultVendorId) {
      throw Object.assign(
        new Error(`No default vendor configured for product ${product.name}`),
        { statusCode: 400 }
      );
    }

    return purchaseService.createPurchaseOrder(
      product.defaultVendorId,
      [{ productId, quantity: shortageQty }],
      userId,
      true
    );
  }

  if (product.procurementType === 'MANUFACTURING') {
    return manufacturingService.createManufacturingOrder(productId, shortageQty, userId, true);
  }

  throw Object.assign(new Error('Unknown procurement type'), { statusCode: 400 });
};

module.exports = { triggerProcurement };
