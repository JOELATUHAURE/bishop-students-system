const { AuditLog } = require('../models');

// Create audit log
exports.createAuditLog = async ({
  userId,
  action,
  resourceType,
  resourceId,
  description,
  ipAddress,
  userAgent,
  previousValues,
  newValues,
  transaction,
}) => {
  try {
    const logData = {
      userId,
      action,
      resourceType,
      resourceId,
      description,
      ipAddress,
      userAgent,
      previousValues,
      newValues,
    };

    if (transaction) {
      return await AuditLog.create(logData, { transaction });
    } else {
      return await AuditLog.create(logData);
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent disrupting main operations
    return null;
  }
};