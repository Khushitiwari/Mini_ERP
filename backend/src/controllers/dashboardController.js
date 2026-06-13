import prisma from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalSalesOrders,
      pendingDeliveries,
      manufacturingOrdersInProgress,
      totalPurchaseOrders,
      partialReceipts,
    ] = await Promise.all([
      prisma.salesOrder.count(),
      prisma.salesOrder.count({
        where: { status: { in: ['CONFIRMED', 'PARTIALLY_DELIVERED'] } },
      }),
      prisma.manufacturingOrder.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({ where: { status: 'PARTIALLY_RECEIVED' } }),
    ]);

    const delayedOrders = await prisma.salesOrder.count({
      where: {
        status: { in: ['CONFIRMED', 'PARTIALLY_DELIVERED'] },
        orderDate: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const summary = {
      totalSalesOrders,
      pendingDeliveries,
      manufacturingOrdersInProgress,
      delayedOrders,
      totalPurchaseOrders,
      partialReceipts,
    };

    return successResponse(res, summary, 'Dashboard summary retrieved');
  } catch (err) {
    next(err);
  }
};
