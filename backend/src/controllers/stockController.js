import * as stockService from '../services/stockService.js';
import prisma from '../config/db.js';
import { successResponse } from '../utils/apiResponse.js';

export const getAllStock = async (req, res, next) => {
  try {
    const stock = await stockService.getAllStockSummary();
    return successResponse(res, stock, 'Stock summary retrieved');
  } catch (err) {
    next(err);
  }
};

export const getStockByProductId = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const stock = await stockService.getStockSummary(productId);
    return successResponse(res, stock, 'Stock retrieved');
  } catch (err) {
    next(err);
  }
};

export const getStockLedger = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const ledger = await stockService.getStockLedger(productId);
    return successResponse(res, ledger, 'Stock ledger retrieved');
  } catch (err) {
    next(err);
  }
};

export const adjustStock = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const { changeQty, reason = 'MANUAL_ADJUSTMENT' } = req.body;

    const result = await stockService.updateStock(
      productId,
      changeQty,
      reason,
      null,
      null,
      req.user.id
    );

    return successResponse(res, result, 'Stock adjusted');
  } catch (err) {
    next(err);
  }
};

export const getStockMovementSummary = async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const ledger = await prisma.stockLedger.findMany({
      where: { timestamp: { gte: since } },
      orderBy: { timestamp: 'asc' },
    });

    const grouped = {};
    ledger.forEach((entry) => {
      const date = entry.timestamp.toISOString().split('T')[0];
      if (!grouped[date]) grouped[date] = { date, totalIn: 0, totalOut: 0 };
      if (entry.changeQty > 0) grouped[date].totalIn += entry.changeQty;
      else grouped[date].totalOut += Math.abs(entry.changeQty);
    });

    const result = [];
    for (let d = 0; d < days; d++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - d));
      const key = date.toISOString().split('T')[0];
      result.push(grouped[key] || { date: key, totalIn: 0, totalOut: 0 });
    }

    return successResponse(res, result, 'Stock movement summary retrieved');
  } catch (err) {
    next(err);
  }
};
