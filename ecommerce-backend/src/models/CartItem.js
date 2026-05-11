module.exports = (sequelize, DataTypes) => {
  const CartItem = sequelize.define('CartItem', {
    cartId: DataTypes.INTEGER,
    productId: DataTypes.INTEGER,
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1 // Important: Default to 1 if not specified
    }
  }, {});

  CartItem.associate = function(models) {
    CartItem.belongsTo(models.Cart, { foreignKey: 'cartId' });
    CartItem.belongsTo(models.Product, { foreignKey: 'productId', as: 'product' });
  };

  return CartItem;
};