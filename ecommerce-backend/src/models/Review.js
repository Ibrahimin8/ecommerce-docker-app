'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Each review is written by a specific user
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Each review belongs to a specific product
      this.belongsTo(models.Product, {
        foreignKey: 'productId',
        as: 'product'
      });
    }
  }

  Review.init({
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5 // Ensures no one can give a 0 or 6 star rating
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true // Comments are usually optional, stars are required
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
    // It's a good practice to name the table plural in the DB
    tableName: 'Reviews', 
  });

  return Review;
};