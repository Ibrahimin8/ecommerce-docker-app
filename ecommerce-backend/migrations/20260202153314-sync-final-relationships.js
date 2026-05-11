'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const addConstraintSafe = async (table, options) => {
      try {
        await queryInterface.addConstraint(table, options);
        console.log(`✅ Constraint ${options.name} added to ${table}`);
      } catch (error) {
        if (error.name === 'SequelizeDatabaseError' && error.message.includes('already exists')) {
          console.log(`ℹ️  Constraint ${options.name} already exists on ${table}, skipping...`);
        } else {
          throw error;
        }
      }
    };

    // 1. User -> Carts & Orders
    await addConstraintSafe('Carts', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_user_cart',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE'
    });

    await addConstraintSafe('Orders', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_user_order',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE'
    });

    // 2. Product -> Category
    await addConstraintSafe('Products', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'fk_product_category',
      references: { table: 'Categories', field: 'id' },
      onDelete: 'SET NULL'
    });

    // 3. Junction Tables (CartItems and OrderItems)
    await addConstraintSafe('CartItems', {
      fields: ['cartId'],
      type: 'foreign key',
      name: 'fk_cartitem_cart',
      references: { table: 'Carts', field: 'id' },
      onDelete: 'CASCADE'
    });

    await addConstraintSafe('OrderItems', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'fk_orderitem_order',
      references: { table: 'Orders', field: 'id' },
      onDelete: 'CASCADE'
    });

    // 4. Reviews
    await addConstraintSafe('Reviews', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_review_user',
      references: { table: 'Users', field: 'id' },
      onDelete: 'CASCADE'
    });

    await addConstraintSafe('Reviews', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_review_product',
      references: { table: 'Products', field: 'id' },
      onDelete: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Standard rollback logic
    await queryInterface.removeConstraint('Products', 'fk_product_category');
    await queryInterface.removeConstraint('Carts', 'fk_user_cart');
    // ... add others as needed
  }
};