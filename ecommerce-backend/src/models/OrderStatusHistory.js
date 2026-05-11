module.exports = (sequelize, DataTypes) => {
  const OrderStatusHistory = sequelize.define('OrderStatusHistory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    changedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: 'OrderStatusHistories',
    timestamps: false,
  });
  
  OrderStatusHistory.associate = (models) => {
    OrderStatusHistory.belongsTo(models.Order, { foreignKey: 'orderId', as: 'order' });
  };

  return OrderStatusHistory;
};