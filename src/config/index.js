const dbConfig = require('./database');

const env = process.env.NODE_ENV || 'development';
const selectedDbConfig = dbConfig[env];

module.exports = {
  app: {
    port: process.env.APP_PORT || 3000,
    env: env
  },
  db: selectedDbConfig
};
