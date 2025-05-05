module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    applicationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Applications',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('transcript', 'certificate', 'identification', 'recommendation', 'other'),
      allowNull: false,
    },
    institution: {
      type: DataTypes.STRING,
    },
    uploadDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER, // Size in bytes
    },
    mimeType: {
      type: DataTypes.STRING,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    verifiedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    verifiedAt: {
      type: DataTypes.DATE,
    },
    comments: {
      type: DataTypes.TEXT,
    },
  }, {
    timestamps: true,
  });

  return Document;
};