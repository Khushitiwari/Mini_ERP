const stockService = require('../services/stockService');
const { successResponse } = require('../utils/apiResponse');

const getAllStock = async (req, res, next) => {
  try {
    const stock = await stockService.getAllStockSummary();
    return successResponse(res, stock, 'Stock summary retrieved');
  } catch (err) {
    next(err);
  }
};

const getStockByProductId = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const stock = await stockService.getStockSummary(productId);
    return successResponse(res, stock, 'Stock retrieved');
  } catch (err) {
    next(err);
  }
};

const getStockLedger = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const ledger = await stockService.getStockLedger(productId);
    return successResponse(res, ledger, 'Stock ledger retrieved');
  } catch (err) {
    next(err);
  }
};

const adjustStock = async (req, res, next) => {
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

module.exports = {
  getAllStock,
  getStockByProductId,
  getStockLedger,
  adjustStock,
};
