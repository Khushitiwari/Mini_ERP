import prisma from '../config/db.js';

const triggerProcurement = async (productId, shortageQty, userId) => {
  console.log('[procurement] triggerProcurement called', { productId, shortageQty, userId });

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

  // Dynamic imports to avoid circular dependencies
  const purchaseService = await import('./purchaseService.js');
  const manufacturingService = await import('./manufacturingService.js');

  console.log('[procurement] product config', {
    name: product.name,
    procurementType: product.procurementType,
    procureOnDemand: product.procureOnDemand,
    defaultVendorId: product.defaultVendorId,
  });

  if (product.procurementType === 'PURCHASE') {
    console.log('[procurement] creating auto PO for shortage', shortageQty);
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
    console.log('[procurement] creating auto MO for shortage', shortageQty);
    return manufacturingService.createManufacturingOrder(productId, shortageQty, userId, true);
  }

  throw Object.assign(new Error('Unknown procurement type'), { statusCode: 400 });
};

export { triggerProcurement };
