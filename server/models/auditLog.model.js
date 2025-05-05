module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resourceId: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    ipAddress: {
      type: DataTypes.STRING,
    },
    userAgent: {
      type: DataTypes.STRING,
    },
    previousValues: {
      type: DataTypes.JSONB,
    },
    newValues: {
      type: DataTypes.JSONB,
    },
  }, {
    timestamps: true,
  });

  return AuditLog;
};