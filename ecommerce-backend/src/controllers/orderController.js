const { User, Product, Order, OrderItem, OrderStatusHistory, sequelize } = require('../models');
const { Op } = require('sequelize');
const redisClient = require('../config/redis'); 

// Helper to clear product-related cache to ensure Home page reflects real-time stock
const clearProductCache = async () => {
  try {
    const keys = await redisClient.keys('products:*');
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log("Redis Product Cache Cleared");
    }
  } catch (err) {
    console.error("Redis Clear Error:", err);
  }
};

// --- 1. CREATE NEW ORDER (With Map & Awaiting Payment Status) ---
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, totalPrice, city, subCity, woreda, phone, latitude, longitude } = req.body;
    
    // 1. Stock Validation
    for (const item of items) {
      const product = await Product.findByPk(item.id, { transaction: t });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
      product.stock -= item.quantity;
      await product.save({ transaction: t });
    }

    // 2. Create Order with 'awaiting_payment' status and Map Coordinates
    const order = await Order.create({
      userId: req.user.id,
      totalPrice,
      city, subCity, woreda, phone,
      latitude, longitude, // Added from Leaflet map
      status: 'awaiting_payment' 
    }, { transaction: t });

    // 3. Create Order Items & History
    const orderItems = items.map(item => ({
      orderId: order.id,
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    }));
    await OrderItem.bulkCreate(orderItems, { transaction: t });

    await OrderStatusHistory.create({
      orderId: order.id,
      status: 'awaiting_payment',
      changedAt: new Date()
    }, { transaction: t });

    await t.commit();
    await clearProductCache(); 

    res.status(201).json({ 
      message: "Order initiated", 
      orderId: order.id,
      totalPrice: totalPrice 
    });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

// --- 2. GET A SINGLE ORDER ---
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(id) || id === 'undefined') {
      return res.status(400).json({ message: "Invalid Order ID provided." });
    }

    const orderId = parseInt(id);
    let whereClause = { id: orderId };
    if (req.user.role !== 'admin') whereClause.userId = req.user.id;

    const order = await Order.findOne({
      where: whereClause,
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: OrderStatusHistory, as: 'statusHistories' }
      ],
      order: [[{ model: OrderStatusHistory, as: 'statusHistories' }, 'changedAt', 'ASC']]
    });

    if (!order) return res.status(404).json({ message: "Order not found." });
    res.status(200).json({ order });
  } catch (error) {
    res.status(500).json({ message: "Internal server error fetching order." });
  }
};

// --- 3. GET ALL ORDERS (Admin Console) ---
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
        { model: User, attributes: ['id', 'name', 'email'], required: !!search,
          where: search ? { [Op.or]: [{ email: { [Op.iLike]: `%${search}%` } }, { name: { [Op.iLike]: `%${search}%` } }] } : null
        },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: OrderStatusHistory, as: 'statusHistories' }
      ],
      order: [['createdAt', 'DESC'], [{ model: OrderStatusHistory, as: 'statusHistories' }, 'changedAt', 'ASC']],
      distinct: true
    });

    res.status(200).json({ totalItems: count, totalPages: Math.ceil(count / limit), currentPage: parseInt(page), orders });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch orders." });
  }
};

// --- 4. GET MY ORDERS (User Tracking) ---
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] },
        { model: OrderStatusHistory, as: 'statusHistories' }
      ],
      order: [['createdAt', 'DESC'], [{ model: OrderStatusHistory, as: 'statusHistories' }, 'changedAt', 'ASC']]
    });
    res.status(200).json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch history." });
  }
};

// --- 5. CANCEL ORDER ---
exports.cancelOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const order = await Order.findOne({ where: { id }, include: [{ model: OrderItem, as: 'items' }] });

    if (!order) { await t.rollback(); return res.status(404).json({ message: "Order not found." }); }
    if (order.userId !== req.user.id && req.user.role !== 'admin') { await t.rollback(); return res.status(403).json({ message: "Unauthorized." }); }
    
    // Only allow cancellation if payment hasn't been verified yet
    if (order.status !== 'awaiting_payment' && order.status !== 'pending') { 
      await t.rollback(); 
      return res.status(400).json({ message: "Cannot cancel order at this stage." }); 
    }

    for (const item of order.items) {
      await Product.increment('stock', { by: item.quantity, where: { id: item.productId }, transaction: t });
    }

    order.status = 'cancelled';
    await order.save({ transaction: t });
    await OrderStatusHistory.create({ orderId: order.id, status: 'cancelled', changedAt: new Date() }, { transaction: t });

    await t.commit();
    await clearProductCache();
    res.status(200).json({ message: "Order cancelled." });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ message: "Cancellation failed." });
  }
};

// --- 6. REORDER ---
exports.reorder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const originalOrder = await Order.findOne({ where: { id: req.params.id, userId: req.user.id }, include: [{ model: OrderItem, as: 'items' }] });
    if (!originalOrder) { await t.rollback(); return res.status(404).json({ message: "Original not found." }); }

    const newOrder = await Order.create({
      userId: req.user.id, totalPrice: originalOrder.totalPrice, phone: originalOrder.phone,
      city: originalOrder.city, subCity: originalOrder.subCity, woreda: originalOrder.woreda,
      latitude: originalOrder.latitude, longitude: originalOrder.longitude, status: 'awaiting_payment'
    }, { transaction: t });

    const itemsToSave = originalOrder.items.map(item => ({
      orderId: newOrder.id, productId: item.productId, quantity: item.quantity, price: item.price, name: item.name
    }));

    await OrderItem.bulkCreate(itemsToSave, { transaction: t });
    await OrderStatusHistory.create({ orderId: newOrder.id, status: 'awaiting_payment', changedAt: new Date() }, { transaction: t });

    await t.commit();
    await clearProductCache();
    res.status(201).json({ message: "Reordered", orderId: newOrder.id });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ message: "Reorder failed." });
  }
};

// --- 7. SALES STATS (Admin Only) ---
exports.getSalesStats = async (req, res) => {
  try {
    const totalRevenue = await Order.sum('totalPrice', { where: { status: 'complete' } });
    const totalOrders = await Order.count();
    const recentOrders = await Order.findAll({ limit: 5, order: [['createdAt', 'DESC']], include: [{ model: User, attributes: ['name', 'email'] }] });
    res.status(200).json({ stats: { totalRevenue: totalRevenue || 0, totalOrders, recentOrders } });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch stats." });
  }
};

// --- 8. TOP SELLERS (Admin Only) ---
exports.getTopSellers = async (req, res) => {
  try {
    const topSellers = await OrderItem.findAll({
      attributes: ['productId', [sequelize.fn('SUM', sequelize.col('quantity')), 'totalSold'], [sequelize.fn('SUM', sequelize.literal('quantity * "OrderItem"."price"')), 'totalRevenue']],
      include: [{ model: Product, as: 'product', attributes: ['name', 'price', 'images'] }],
      group: ['productId', 'product.id'],
      order: [[sequelize.literal('"totalSold"'), 'DESC']],
      limit: 5
    });
    res.status(200).json({ topSellers });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch top sellers." });
  }
};

// --- 9. UPDATE ORDER STATUS (Admin Verification) ---
exports.updateOrderStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body; 
    const order = await Order.findByPk(id);

    if (!order) { 
      await t.rollback(); 
      return res.status(404).json({ message: "Order not found." }); 
    }

    order.status = status;
    await order.save({ transaction: t });

    await OrderStatusHistory.create({ 
      orderId: order.id, 
      status: status, 
      changedAt: new Date() 
    }, { transaction: t });

    await t.commit();
    await clearProductCache(); 

    res.status(200).json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    if (t) await t.rollback();
    res.status(500).json({ message: "Failed to update order status." });
  }
};

// --- 10. UPLOAD RECEIPT (User Side) ---
exports.uploadReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ where: { id, userId: req.user.id } });

    if (!order) return res.status(404).json({ message: "Order not found." });
    if (!req.file || !req.file.path) return res.status(400).json({ message: "No image uploaded." });

    order.receiptImage = req.file.path; 
    await order.save();

    // ALIGNMENT FIX: returning 'receiptUrl' to match frontend state logic
    res.status(200).json({ 
      message: "Receipt uploaded successfully", 
      receiptUrl: order.receiptImage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};