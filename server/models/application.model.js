module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    applicationNumber: {
      type: DataTypes.STRING,
      unique: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'under_review', 'approved', 'rejected', 'waitlisted'),
      defaultValue: 'draft',
    },
    currentStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    completedSteps: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    },
    program: {
      type: DataTypes.STRING,
    },
    department: {
      type: DataTypes.STRING,
    },
    academicYear: {
      type: DataTypes.STRING,
    },
    semester: {
      type: DataTypes.STRING,
    },
    disabilityStatus: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    disabilityType: {
      type: DataTypes.STRING,
    },
    emergencyContactName: {
      type: DataTypes.STRING,
    },
    emergencyContactPhone: {
      type: DataTypes.STRING,
    },
    emergencyContactRelationship: {
      type: DataTypes.STRING,
    },
    submittedAt: {
      type: DataTypes.DATE,
    },
    reviewedAt: {
      type: DataTypes.DATE,
    },
    reviewedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    comments: {
      type: DataTypes.TEXT,
    },
    rejectionReason: {
      type: DataTypes.TEXT,
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: (application) => {
        // Generate application number based on current time and random value
        const timestamp = new Date().getTime().toString().slice(-6);
        const random = Math.floor(Math.random() * 9000) + 1000;
        application.applicationNumber = `BSU-${timestamp}${random}`;
      },
    },
  });

  return Application;
};