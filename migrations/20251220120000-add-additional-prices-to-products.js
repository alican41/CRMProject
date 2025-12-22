'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'additional_prices', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Farklı fiyat türleri için JSON alanı (örn: { "toptan": 100, "indirimli": 90 })'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'additional_prices');
  }
};
