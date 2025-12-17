'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Ürün adı'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Ürün açıklaması'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Ürün fiyatı'
      },
      stock_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Stok miktarı'
      },
      is_stock_tracking_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Stok takibi aktif mi? False ise stok kontrolü yapılmaz (sınırsız stok)'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Ürün aktif mi? (Soft delete için)'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Performans için indexler
    await queryInterface.addIndex('products', ['name'], {
      name: 'products_name_idx'
    });

    await queryInterface.addIndex('products', ['is_active'], {
      name: 'products_is_active_idx'
    });

    await queryInterface.addIndex('products', ['is_stock_tracking_active'], {
      name: 'products_is_stock_tracking_active_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
