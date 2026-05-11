'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const products = [];
    for (let i = 1; i <= 20; i++) {
      products.push({
        name: `Product ${i}`,
        description: `High-quality description for product ${i}`,
        price: (Math.random() * 1000).toFixed(2),
        stock: 50,
        categoryId: Math.floor(Math.random() * 5) + 1, // Assigns to IDs 1-5
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    return queryInterface.bulkInsert('Products', products);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Products', null, {});
  }
};