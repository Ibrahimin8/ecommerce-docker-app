'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OrderStatusHistories', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: { type: Sequelize.STRING, allowNull: false },
      changedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('OrderStatusHistories');
  },
};