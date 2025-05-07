module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define('user', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active'
    },
    lastLogin: {
      type: Sequelize.DATE
    },
    phone: {
      type: Sequelize.STRING,
      validate: {
        is: /^\+\d{10,15}$/,
      },
    },
    gender: {
      type: Sequelize.ENUM('male', 'female', 'other', 'prefer not to say'),
    },
    dateOfBirth: {
      type: Sequelize.DATEONLY,
    },
    nationality: {
      type: Sequelize.STRING,
    },
    settlementSite: {
      type: Sequelize.ENUM('Rwamwanja', 'Kyangwali', 'Nakivale', 'Other', 'None'),
      defaultValue: 'None',
    },
    refugeeId: {
      type: Sequelize.STRING,
    },
    address: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    country: {
      type: Sequelize.STRING,
    },
    postalCode: {
      type: Sequelize.STRING,
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
    isVerified: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    preferredLanguage: {
      type: Sequelize.ENUM('english', 'swahili', 'french', 'arabic', 'runyankole'),
      defaultValue: 'english',
    },
    resetPasswordToken: {
      type: Sequelize.STRING,
    },
    resetPasswordExpire: {
      type: Sequelize.DATE,
    },
    lastLoginAt: {
      type: Sequelize.DATE,
    },
  }, {
    timestamps: true,
    paranoid: true, // Add soft deletion
  });

  return User;
};