const { Sequelize } = require('sequelize');
const config = require('../config');
const logger = require('../lib/logger');

const sequelize = new Sequelize(
  config.db.database,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: config.db.dialect,
    logging: config.db.logging, // Config'den gelen ayarı kullan
    pool: config.db.pool // Production pool ayarları için
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Development'ta query logging
if (process.env.NODE_ENV === 'development') {
  sequelize.options.logging = (sql, timing) => {
    logger.debug('Database Query', {
      sql,
      executionTime: timing ? `${timing}ms` : 'N/A'
    });
  };
}

// Modeller
db.Customer = require('./customer')(sequelize, Sequelize.DataTypes);
db.Order = require('./order')(sequelize, Sequelize.DataTypes);
db.OrderItem = require('./orderItem')(sequelize, Sequelize.DataTypes);
db.Product = require('./product')(sequelize, Sequelize.DataTypes);

// İlişkiler
db.Customer.hasMany(db.Order, { foreignKey: 'customerId' });
db.Order.belongsTo(db.Customer, { foreignKey: 'customerId' });

db.Order.hasMany(db.OrderItem, {
  foreignKey: 'orderId',
  as: 'items'
});

db.OrderItem.belongsTo(db.Order, {
  foreignKey: 'orderId',
  as: 'order'
});

// Product - OrderItem ilişkisi
db.Product.hasMany(db.OrderItem, {
  foreignKey: 'productId',
  as: 'orderItems'
});

db.OrderItem.belongsTo(db.Product, {
  foreignKey: 'productId',
  as: 'product'
});

module.exports = db;
