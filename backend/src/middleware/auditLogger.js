const prisma = require('../config/db');

const createAuditLog = async ({ userId, action, entityType, entityId, oldValue = null, newValue = null }) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValue,
        newValue,
      },
    });
  } catch (err) {
    console.error('Failed to create audit log:', err.message);
  }
};

module.exports = { createAuditLog };
