'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. User Relationships
    await queryInterface.addConstraint('Cart', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_user_cart',
      references: { table: 'User', field: 'id' },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('Order', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_user_order',
      references: { table: 'User', field: 'id' },
      onDelete: 'CASCADE'
    });

    // 2. Product & Category
    await queryInterface.addConstraint('Product', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'fk_product_category',
      references: { table: 'Category', field: 'id' },
      onDelete: 'SET NULL'
    });

    // 3. CartItem Junctions
    await queryInterface.addConstraint('CartItem', {
      fields: ['cartId'],
      type: 'foreign key',
      name: 'fk_cartitem_cart',
      references: { table: 'Cart', field: 'id' },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('CartItem', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_cartitem_product',
      references: { table: 'Product', field: 'id' },
      onDelete: 'CASCADE'
    });

    // 4. OrderItem Junctions
    await queryInterface.addConstraint('OrderItem', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'fk_orderitem_order',
      references: { table: 'Order', field: 'id' },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('OrderItem', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_orderitem_product',
      references: { table: 'Product', field: 'id' },
      onDelete: 'CASCADE'
    });

    // 5. Review Connections
    await queryInterface.addConstraint('Review', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_review_user',
      references: { table: 'User', field: 'id' },
      onDelete: 'CASCADE'
    });

    await queryInterface.addConstraint('Review', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_review_product',
      references: { table: 'Product', field: 'id' },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // To undo, we remove constraints by name
    await queryInterface.removeConstraint('Cart', 'fk_user_cart');
    await queryInterface.removeConstraint('Order', 'fk_user_order');
    await queryInterface.removeConstraint('Product', 'fk_product_category');
    // ... add remaining removals if needed
  }
};