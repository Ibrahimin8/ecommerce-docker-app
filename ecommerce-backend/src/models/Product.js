// src/models/product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define('Product', {
    name: DataTypes.STRING,
    price: DataTypes.DECIMAL,
    description: DataTypes.TEXT,
    stock: DataTypes.INTEGER,
    categoryId: DataTypes.INTEGER,
    // Add this line below
    images: DataTypes.STRING 
  }, {});

  Product.associate = function(models) {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
  };

  return Product;
};