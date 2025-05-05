const { Sequelize } = require('sequelize');
const config = require('../config/db.config.js')[process.env.NODE_ENV || 'development'];

// Create Sequelize instance
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    dialectOptions: config.dialectOptions,
    pool: config.pool
  }
);

// Initialize models
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model')(sequelize, Sequelize);
db.Role = require('./role.model')(sequelize, Sequelize);
db.Application = require('./application.model')(sequelize, Sequelize);
db.Document = require('./document.model')(sequelize, Sequelize);
db.Education = require('./education.model')(sequelize, Sequelize);
db.Notification = require('./notification.model')(sequelize, Sequelize);
db.AuditLog = require('./auditLog.model')(sequelize, Sequelize);

// Define associations
db.User.belongsToMany(db.Role, {
  through: 'user_roles',
  foreignKey: 'userId',
  otherKey: 'roleId'
});

db.Role.belongsToMany(db.User, {
  through: 'user_roles',
  foreignKey: 'roleId',
  otherKey: 'userId'
});

db.User.hasMany(db.Application, { foreignKey: 'userId' });
db.Application.belongsTo(db.User, { foreignKey: 'userId' });

db.Application.hasMany(db.Document, { foreignKey: 'applicationId' });
db.Document.belongsTo(db.Application, { foreignKey: 'applicationId' });

db.Application.hasMany(db.Education, { foreignKey: 'applicationId' });
db.Education.belongsTo(db.Application, { foreignKey: 'applicationId' });

db.User.hasMany(db.Notification, { foreignKey: 'userId' });
db.Notification.belongsTo(db.User, { foreignKey: 'userId' });

db.User.hasMany(db.AuditLog, { foreignKey: 'userId' });
db.AuditLog.belongsTo(db.User, { foreignKey: 'userId' });

module.exports = db;