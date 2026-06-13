import prisma from '../config/db.js';

/**
 * Writes an audit log row. Failures are swallowed so business operations never fail.
 */
export const logAudit = async (userId, action, entityType, entityId, oldValue = null, newValue = null) => {
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
