'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Customer email index (unique için)
    await queryInterface.addIndex('customers', ['email'], {
      unique: true,
      name: 'customers_email_unique'
    });

    // Customer phone index
    await queryInterface.addIndex('customers', ['phone'], {
      name: 'customers_phone_idx'
    });

    // Customer is_active index (filtering için)
    await queryInterface.addIndex('customers', ['is_active'], {
      name: 'customers_is_active_idx'
    });

    // Order customer_id index (foreign key için)
    await queryInterface.addIndex('orders', ['customer_id'], {
      name: 'orders_customer_id_idx'
    });

    // Order status index (filtering için)
    await queryInterface.addIndex('orders', ['status'], {
      name: 'orders_status_idx'
    });

    // Order created_at index (sorting için)
    await queryInterface.addIndex('orders', ['created_at'], {
      name: 'orders_created_at_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('customers', 'customers_email_unique');
    await queryInterface.removeIndex('customers', 'customers_phone_idx');
    await queryInterface.removeIndex('customers', 'customers_is_active_idx');
    await queryInterface.removeIndex('orders', 'orders_customer_id_idx');
    await queryInterface.removeIndex('orders', 'orders_status_idx');
    await queryInterface.removeIndex('orders', 'orders_created_at_idx');
  }
};