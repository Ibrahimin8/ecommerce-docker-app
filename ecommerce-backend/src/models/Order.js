'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: 'userId' });
      this.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
      this.hasMany(models.OrderStatusHistory, { foreignKey: 'orderId', as: 'statusHistories', onDelete: 'CASCADE' });
    }
  }

  Order.init({
    totalPrice: DataTypes.DOUBLE,
    status: {
      type: DataTypes.STRING,
      // Statuses: awaiting_payment, pending, shipment, cancelled, complete
      defaultValue: 'awaiting_payment' 
    },
    userId: DataTypes.INTEGER,
    city: { type: DataTypes.STRING, allowNull: false },
    subCity: { type: DataTypes.STRING, allowNull: false },
    woreda: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    latitude: { type: DataTypes.DOUBLE, allowNull: true },
    longitude: { type: DataTypes.DOUBLE, allowNull: true },
    receiptImage: { type: DataTypes.STRING, allowNull: true } // ADD THIS FIELD
  }, {
    sequelize,
    modelName: 'Order',
  });

  return Order;
};