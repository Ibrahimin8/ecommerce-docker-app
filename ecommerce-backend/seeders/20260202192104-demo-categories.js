'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Categories', [
      { name: 'Electronics', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Laptops', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Smartphones', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Accessories', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Audio', createdAt: new Date(), updatedAt: new Date() }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Categories', null, {});
  }
};