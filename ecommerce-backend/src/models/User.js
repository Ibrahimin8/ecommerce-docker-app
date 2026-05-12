'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // When a user is deleted, delete their Cart, Orders, and Reviews
      User.hasOne(models.Cart, { 
        foreignKey: 'userId', 
        as: 'Cart',
        onDelete: 'CASCADE',
        hooks: true 
      });
      User.hasMany(models.Order, { 
        foreignKey: 'userId', 
        as: 'Orders',
        onDelete: 'CASCADE',
        hooks: true 
      });
      User.hasMany(models.Review, { 
        foreignKey: 'userId', 
        as: 'reviews', // Added reviews association
        onDelete: 'CASCADE',
        hooks: true 
      });
    }
  }
  User.init({
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user',
      validate: { isIn: [['user', 'admin']] }
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });
  return User;
};