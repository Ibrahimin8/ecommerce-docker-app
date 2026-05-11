const { User, Product, Order, OrderItem, OrderStatusHistory, sequelize } = require('../models');
const { Op } = require('sequelize');

// --- 1. CREATE NEW ORDER ---
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, totalPrice, city, subCity, woreda, phone, latitude, longitude } = req.body;
    const userId = req.user.id;

    // 1. Create the Order
    const order = await Order.create({
      userId,
      totalPrice,
      city,
      subCity,
      woreda,
      phone,
      latitude,
      longitude,
      status: 'pending'
    }, { transaction: t });

    // 2. Create Order Items
    const orderItems = items.map(item => ({
      orderId: order.id,
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));
    await OrderItem.bulkCreate(orderItems, { transaction: t });

    // 3. Create initial status history
    await OrderStatusHistory.create({
      orderId: order.id,
      status: 'pending',
      changedAt: new Date()
    }, { transaction: t });

    await t.commit();

    // 4. IMPORTANT: Return the format the frontend expects!
    // We send back an 'order' object containing the 'id'
    res.status(201).json({ 
      message: "Order created successfully", 
      order: { id: order.id } 
    });

  } catch (error) {
    if (t) await t.rollback();
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to create order." });
  }
};
// --- 2. GET A SINGLE ORDER (Corrected nested sorting) ---
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Validate ID: Prevent 'undefined' or non-numeric strings from hitting DB
    if (!id || isNaN(id) || id === 'undefined') {
      return res.status(400).json({ message: "Invalid Order ID provided." });
    }

    const orderId = parseInt(id);
    let whereClause = { id: orderId };
    
    // If not admin, ensure the user can only see their own order
    if (req.user.role !== 'admin') {
      whereClause.userId = req.user.id;
    }

    const order = await Order.findOne({
      where: whereClause,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistories'
        }
      ],
      order: [
        [{ model: OrderStatusHistory, as: 'statusHistories' }, 'changedAt', 'ASC']
      ]
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.status(200).json({ order });

  } catch (error) {
    console.error("ORDER GET ERROR:", error);
    res.status(500).json({ message: "Internal server error fetching order." });
  }
};

// --- 3. GET ALL ORDERS (Admin Only, Paginated) ---
exports.getAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let whereClause = {};
    if (status) whereClause.status = status;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          where: search ? {
            [Op.or]: [
              { email: { [Op.iLike]: `%${search}%` } },
              { name: { [Op.iLike]: `%${search}%` } }
            ]
          } : null,
          required: !!search
        },
        {
          model: OrderItem,
          as: 'items',
          include: [{ model: Product, as: 'product' }]
        },
        {
          model: OrderStatusHistory,
          as: 'statusHistories'
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: OrderStatusHistory, as: 'statusHistories' }, 'changedAt', 'ASC']
      ],
      distinct: true
    });

    res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      orders
    });
  } catch (error) {
    console.error("ORDER LIST ERROR:", error);
    res.status(500).json({ message: "Could not fetch orders." });
  }
};

// --- 4. GET MY ORDERS ---
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: OrderStatusHistory, as: 'statusHistories' }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: OrderStatusHistory, as: 'statusHistories' }, 'changedAt', 'ASC']
      ]
    });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("ORDER HISTORY ERROR:", error);
    res.status(500).json({ message: "Could not fetch history." });
  }
};

// --- 5. CANCEL ORDER (User/Admin) ---
exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      where: { id },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      await t.rollback();
      return res.status(403).json({ message: "Unauthorized." });
    }

    if (order.status !== 'pending') {
      await t.rollback();
      return res.status(400).json({ message: "Cannot cancel non-pending order." });
    }

    for (const item of order.items) {
      await Product.increment('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
    }

    order.status = 'cancelled';
    await order.save({ transaction: t });

    await OrderStatusHistory.create({
      orderId: order.id,
      status: 'cancelled',
      changedAt: new Date()
    }, { transaction: t });

    await t.commit();
    res.status(200).json({ message: "Order cancelled." });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Cancellation failed." });
  }
};

// --- 6. REORDER ---
exports.reorder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const originalOrder = await Order.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: OrderItem, as: 'items' }]
    });

    if (!originalOrder) {
      await t.rollback();
      return res.status(404).json({ message: "Original not found." });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      totalPrice: originalOrder.totalPrice,
      phone: originalOrder.phone,
      city: originalOrder.city,
      subCity: originalOrder.subCity,
      woreda: originalOrder.woreda,
      latitude: originalOrder.latitude,
      longitude: originalOrder.longitude,
      status: 'pending'
    }, { transaction: t });

    const itemsToSave = originalOrder.items.map(item => ({
      orderId: newOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));

    await OrderItem.bulkCreate(itemsToSave, { transaction: t });
    await OrderStatusHistory.create({ orderId: newOrder.id, status: 'pending', changedAt: new Date() }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: "Reordered", orderId: newOrder.id });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Reorder failed." });
  }
};

// --- 7. ADMIN SALES STATS ---
exports.getSalesStats = async (req, res) => {
  try {
    // Calculate total revenue from completed orders
    const totalRevenue = await Order.sum('totalPrice', { 
      where: { status: 'completed' } 
    });

    // Count all orders in the system
    const totalOrders = await Order.count();

    // Fetch the 5 most recent orders with user details
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['name', 'email'] }]
    });

    res.status(200).json({
      stats: {
        totalRevenue: totalRevenue || 0,
        totalOrders,
        recentOrders
      }
    });
  } catch (error) {
    console.error("STATS ERROR:", error);
    res.status(500).json({ message: "Could not fetch stats." });
  }
};

// --- 8. ADMIN TOP SELLERS ---
exports.getTopSellers = async (req, res) => {
  try {
    const topSellers = await OrderItem.findAll({
      attributes: [
        'productId',
        [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'],
        [sequelize.fn('SUM', sequelize.literal('quantity * "OrderItem"."price"')), 'totalRevenue']
      ],
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'price', 'images']
        }
      ],
      group: ['productId', 'product.id'],
      // Sort by the calculated "totalSold" column
      order: [[sequelize.literal('"totalSold"'), 'DESC']],
      limit: 5
    });

    res.status(200).json({ topSellers });
  } catch (error) {
    console.error("TOP SELLERS ERROR:", error);
    res.status(500).json({ message: "Could not fetch top sellers." });
  }
};
// --- 9. ADMIN: UPDATE ORDER STATUS ---
exports.updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    // 1. Find the order by Primary Key
    const order = await Order.findByPk(id);

    if (!order) {
      await t.rollback();
      return res.status(404).json({ message: "Order not found." });
    }

    // 2. Update the status field
    order.status = status;
    await order.save({ transaction: t });

    // 3. Create a record in the history table
    await OrderStatusHistory.create({
      orderId: order.id,
      status: status,
      changedAt: new Date()
    }, { transaction: t });

    await t.commit();

    res.status(200).json({ 
      message: `Order status updated to ${status}`,
      order 
    });
  } catch (error) {
    if (t) await t.rollback();
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Failed to update order status." });
  }
};