module.exports = (sequelize, DataTypes) => {
  const Education = sequelize.define('Education', {
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
    institutionName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institutionType: {
      type: DataTypes.ENUM('high_school', 'college', 'university', 'vocational', 'other'),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    degree: {
      type: DataTypes.STRING,
    },
    fieldOfStudy: {
      type: DataTypes.STRING,
    },
    startDate: {
      type: DataTypes.DATEONLY,
    },
    endDate: {
      type: DataTypes.DATEONLY,
    },
    isCurrentlyStudying: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    grade: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
  }, {
    timestamps: true,
  });

  return Education;
};