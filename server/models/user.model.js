module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^\+\d{10,15}$/,
      },
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other', 'prefer not to say'),
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
    },
    nationality: {
      type: DataTypes.STRING,
    },
    settlementSite: {
      type: DataTypes.ENUM('Rwamwanja', 'Kyangwali', 'Nakivale', 'Other', 'None'),
      defaultValue: 'None',
    },
    refugeeId: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    country: {
      type: DataTypes.STRING,
    },
    postalCode: {
      type: DataTypes.STRING,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    preferredLanguage: {
      type: DataTypes.ENUM('english', 'swahili', 'french', 'arabic', 'runyankole'),
      defaultValue: 'english',
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
    },
    resetPasswordExpire: {
      type: DataTypes.DATE,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
    paranoid: true, // Add soft deletion
  });

  return User;
};