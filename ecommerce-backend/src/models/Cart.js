'use strict';
module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define('Cart', {
    userId: DataTypes.INTEGER
  }, {});

  Cart.associate = function(models) {
    // The "belongsTo" side stays simple
    Cart.belongsTo(models.User, { foreignKey: 'userId' });
    Cart.hasMany(models.CartItem, { 
      foreignKey: 'cartId', 
      as: 'items',
      onDelete: 'CASCADE' // Also delete items if cart is deleted
    });
  };

  return Cart;
};