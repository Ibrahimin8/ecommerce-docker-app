'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      // 1. Link back to the main Order
      this.belongsTo(models.Order, { 
        foreignKey: 'orderId' 
      });

      // 2. Link to the Product
      this.belongsTo(models.Product, { 
        foreignKey: 'productId',
        as: 'product' 
      });
    }
  }
  OrderItem.init({
    orderId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DOUBLE,
    // --- ADD THIS FIELD ---
    name: {
      type: DataTypes.STRING,
      allowNull: true // Set to true if old orders don't have names
    }
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};