'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // product_id kolonu ekle (opsiyonel - product_name hala mevcut)
    await queryInterface.addColumn('order_items', 'product_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // Opsiyonel: Bazı siparişlerde manuel ürün adı girilmiş olabilir
      references: {
        model: 'products',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Ürün tablosuna referans (opsiyonel - product_name ile birlikte kullanılabilir)'
    });

    // Performance index
    await queryInterface.addIndex('order_items', ['product_id'], {
      name: 'order_items_product_id_idx'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('order_items', 'order_items_product_id_idx');
    await queryInterface.removeColumn('order_items', 'product_id');
  }
};
