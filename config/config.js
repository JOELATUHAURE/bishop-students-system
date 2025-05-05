'use strict';

require('dotenv').config(); // Load environment variables from .env

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres.iwdrodqpyisgvdtzgeml',
    password: process.env.DB_PASSWORD || 'Kb3dGJxz3VybmRfY',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: process.env.DB_PORT || 6543,
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.DB_SSL === 'true' ? {
        require: true,
        rejectUnauthorized: false,
      } : false, // Disable SSL if not supported
    },
    logging: false,
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'sequelize_meta',
  },
};