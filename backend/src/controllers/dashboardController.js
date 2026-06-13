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
      salesByStatus,
      moByStatus,
      poByStatus,
    ] = await Promise.all([
      prisma.salesOrder.count(),
      prisma.salesOrder.count({
        where: { status: { in: ['CONFIRMED', 'PARTIALLY_DELIVERED'] } },
      }),
      prisma.manufacturingOrder.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.purchaseOrder.count(),
      prisma.purchaseOrder.count({ where: { status: 'PARTIALLY_RECEIVED' } }),
      prisma.salesOrder.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.manufacturingOrder.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.purchaseOrder.groupBy({ by: ['status'], _count: { id: true } }),
    ]);

    const toMap = (arr) => Object.fromEntries(arr.map((s) => [s.status, s._count.id]));

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
      salesByStatus: toMap(salesByStatus),
      moByStatus: toMap(moByStatus),
      poByStatus: toMap(poByStatus),
    };

    return successResponse(res, summary, 'Dashboard summary retrieved');
  } catch (err) {
    next(err);
  }
};
