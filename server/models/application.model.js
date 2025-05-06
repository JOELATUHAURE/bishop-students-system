module.exports = (sequelize, Sequelize) => {
  const Application = sequelize.define('application', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    status: {
      type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending'
    },
    type: {
      type: Sequelize.ENUM('refugee', 'asylum_seeker'),
      allowNull: false
    },
    reason: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    additionalInfo: {
      type: Sequelize.TEXT
    },
    reviewedBy: {
      type: Sequelize.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    reviewedAt: {
      type: Sequelize.DATE
    },
    reviewNotes: {
      type: Sequelize.TEXT
    }
  });

  return Application;
};