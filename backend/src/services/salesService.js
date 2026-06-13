import prisma from '../config/db.js';
import * as stockService from './stockService.js';

const createSalesOrder = async (customerId, items, userId) => {
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customer) {
    throw Object.assign(new Error('Customer not found'), { statusCode: 404 });
  }

  return prisma.salesOrder.create({
    data: {
      customerId,
      createdBy: userId,
      status: 'DRAFT',
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      },
    },
    include: {
      items: { include: { product: true } },
      customer: true,
      creator: { select: { id: true, name: true, email: true } },
    },
  });
};

const confirmSalesOrder = async (orderId) => {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    throw Object.assign(new Error('Sales order not found'), { statusCode: 404 });
  }
  if (order.status !== 'DRAFT') {
    throw Object.assign(new Error('Only DRAFT sales orders can be confirmed'), { statusCode: 400 });
  }

  // Dynamic import to avoid circular dependency
  const procurementService = await import('./procurementService.js');

  for (const item of order.items) {
    const freeQty = await stockService.getFreeToUseQty(item.productId);
    if (freeQty >= item.quantity) {
      await stockService.reserveStock(item.productId, item.quantity);
    } else {
      const shortageQty = item.quantity - Math.max(0, freeQty);
      if (freeQty > 0) {
        await stockService.reserveStock(item.productId, freeQty);
      }
      const product = item.product;
      if (product.procureOnDemand || product.procurementStrategy === 'MTO') {
        await procurementService.triggerProcurement(item.productId, shortageQty, order.createdBy);
      }
    }
  }

  return prisma.salesOrder.update({
    where: { id: orderId },
    data: { status: 'CONFIRMED' },
    include: {
      items: { include: { product: true } },
      customer: true,
      creator: { select: { id: true, name: true, email: true } },
    },
  });
};

const deliverSalesOrder = async (orderId, deliveredItems, userId) => {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw Object.assign(new Error('Sales order not found'), { statusCode: 404 });
  }
  if (!['CONFIRMED', 'PARTIALLY_DELIVERED'].includes(order.status)) {
    throw Object.assign(new Error('Sales order cannot be delivered in current status'), { statusCode: 400 });
  }

  for (const delivered of deliveredItems) {
    const item = order.items.find((i) => i.id === delivered.itemId);
    if (!item) {
      throw Object.assign(new Error(`Item ${delivered.itemId} not found on order`), { statusCode: 400 });
    }

    const qtyToDeliver = delivered.quantity;
    const remaining = item.quantity - item.deliveredQty;
    if (qtyToDeliver > remaining) {
      throw Object.assign(new Error(`Cannot deliver more than remaining quantity for item ${item.id}`), {
        statusCode: 400,
      });
    }

    await stockService.updateStock(
      item.productId,
      -qtyToDeliver,
      'SALE_DELIVERY',
      orderId,
      'SALES_ORDER',
      userId
    );
    await stockService.releaseReservedStock(item.productId, qtyToDeliver);

    await prisma.salesOrderItem.update({
      where: { id: item.id },
      data: { deliveredQty: item.deliveredQty + qtyToDeliver },
    });
  }

  const updatedItems = await prisma.salesOrderItem.findMany({
    where: { salesOrderId: orderId },
  });

  const allFullyDelivered = updatedItems.every((i) => i.deliveredQty >= i.quantity);
  const newStatus = allFullyDelivered ? 'FULLY_DELIVERED' : 'PARTIALLY_DELIVERED';

  return prisma.salesOrder.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: {
      items: { include: { product: true } },
      customer: true,
      creator: { select: { id: true, name: true, email: true } },
    },
  });
};

const cancelSalesOrder = async (orderId) => {
  const order = await prisma.salesOrder.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw Object.assign(new Error('Sales order not found'), { statusCode: 404 });
  }
  if (['FULLY_DELIVERED', 'CANCELLED'].includes(order.status)) {
    throw Object.assign(new Error('Sales order cannot be cancelled'), { statusCode: 400 });
  }

  if (['CONFIRMED', 'PARTIALLY_DELIVERED'].includes(order.status)) {
    for (const item of order.items) {
      const undelivered = item.quantity - item.deliveredQty;
      if (undelivered > 0) {
        await stockService.releaseReservedStock(item.productId, undelivered);
      }
    }
  }

  return prisma.salesOrder.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
    include: {
      items: { include: { product: true } },
      customer: true,
      creator: { select: { id: true, name: true, email: true } },
    },
  });
};

export {
  createSalesOrder,
  confirmSalesOrder,
  deliverSalesOrder,
  cancelSalesOrder,
};
