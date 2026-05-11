'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // 1. Link to the User who placed the order
      this.belongsTo(models.User, { 
        foreignKey: 'userId' 
      });

      // 2. Link to the items inside this order
      this.hasMany(models.OrderItem, { 
        foreignKey: 'orderId', 
        as: 'items' 
      });

      // 3. NEW: Link to the status history tracking
      // This allows you to see the timeline of the order
      this.hasMany(models.OrderStatusHistory, { 
        foreignKey: 'orderId', 
        as: 'statusHistories' 
      });
    }
  }

  Order.init({
    totalPrice: DataTypes.DOUBLE,
    status: {
      type: DataTypes.STRING,
      defaultValue: 'pending'
    },
    userId: DataTypes.INTEGER,
    
    // --- New Ethiopian Address Fields ---
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    subCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    woreda: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    
    // --- Map Location Coordinates (Matches your Orders.csv) ---
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Order',
  });

  return Order;
};