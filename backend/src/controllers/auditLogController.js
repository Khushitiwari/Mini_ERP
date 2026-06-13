const prisma = require('../config/db');
const { successResponse } = require('../utils/apiResponse');

const getAuditLogs = async (req, res, next) => {
  try {
    const { entityType, userId, startDate, endDate } = req.query;
    const where = {};

    if (entityType) where.entityType = entityType;
    if (userId) where.userId = parseInt(userId, 10);
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = new Date(startDate);
      if (endDate) where.timestamp.lte = new Date(endDate);
    }

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: 200,
    });

    return successResponse(res, logs, 'Audit logs retrieved');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditLogs };
