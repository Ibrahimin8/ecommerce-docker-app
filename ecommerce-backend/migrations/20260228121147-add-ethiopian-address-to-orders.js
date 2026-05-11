'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Adding Ethiopian address components
    await queryInterface.addColumn('Orders', 'city', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Orders', 'subCity', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Orders', 'woreda', {
      type: Sequelize.STRING,
      allowNull: false
    });
    await queryInterface.addColumn('Orders', 'phone', {
      type: Sequelize.STRING,
      allowNull: false
    });

    // Adding Map Coordinates
    await queryInterface.addColumn('Orders', 'latitude', {
      type: Sequelize.DOUBLE,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'longitude', {
      type: Sequelize.DOUBLE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Reverting the changes in case of a rollback
    await queryInterface.removeColumn('Orders', 'city');
    await queryInterface.removeColumn('Orders', 'subCity');
    await queryInterface.removeColumn('Orders', 'woreda');
    await queryInterface.removeColumn('Orders', 'phone');
    await queryInterface.removeColumn('Orders', 'latitude');
    await queryInterface.removeColumn('Orders', 'longitude');
  }
};