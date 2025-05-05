module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('email', 'sms', 'in_app'),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    relatedTo: {
      type: DataTypes.STRING, // Application ID, etc.
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'delivered', 'failed'),
      defaultValue: 'pending',
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    sentAt: {
      type: DataTypes.DATE,
    },
    readAt: {
      type: DataTypes.DATE,
    },
    metadata: {
      type: DataTypes.JSONB, // Additional metadata
    },
  }, {
    timestamps: true,
  });

  return Notification;
};