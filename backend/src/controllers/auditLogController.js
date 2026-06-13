const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');

const getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, userId, action, startDate, endDate } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    const where = {};

    if (entityType) where.entityType = entityType;
    if (userId) where.userId = parseInt(userId, 10);
    if (action) where.action = action;
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return successResponse(
      res,
      {
        items: logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      'Audit logs retrieved'
    );
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };
