'use strict';

require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'postgres.iwdrodqpyisgvdtzgeml',
    password: process.env.DB_PASSWORD || 'Kb3dGJxz3VybmRfY',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: process.env.DB_PORT || 6543,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectTimeout: 30000, // 30 seconds
    },
    logging: false,
    migrationStorage: 'sequelize',
    migrationStorageTableName: 'sequelize_meta',
  },

  test: {
    username: process.env.DB_USER || 'postgres.iwdrodqpyisgvdtzgeml',
    password: process.env.DB_PASSWORD || 'Kb3dGJxz3VybmRfY',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: process.env.DB_PORT || 6543,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    },
    logging: false,
  },

  production: {
    username: process.env.DB_USER || 'postgres.iwdrodqpyisgvdtzgeml',
    password: process.env.DB_PASSWORD || 'Kb3dGJxz3VybmRfY',
    database: process.env.DB_NAME || 'postgres',
    host: process.env.DB_HOST || 'aws-0-us-east-1.pooler.supabase.com',
    port: process.env.DB_PORT || 6543,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
      connectTimeout: 30000,
    },
    logging: false,
  },
};
