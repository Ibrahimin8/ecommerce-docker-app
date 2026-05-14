const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const redisClient = require('../config/redis'); // Your Redis client

// Helper to clear product-related cache
const clearProductCache = async () => {
  const keys = await redisClient.keys('products:*');
  if (keys.length > 0) await redisClient.del(keys);
};

// 1. VIEW ALL PRODUCTS (With Caching)
exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    // Create a unique cache key based on query params
    const cacheKey = `products:all:cat${categoryId || 'none'}:search${search || 'none'}`;

    // Try to get from Redis
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) return res.status(200).json(JSON.parse(cachedData));

    let whereClause = {};
    if (categoryId) whereClause.categoryId = categoryId;
    if (search) whereClause.name = { [Op.iLike]: `%${search}%` };

    const products = await Product.findAll({
      where: whereClause,
      include: [{ model: Category, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });

    // Save to Redis for 10 minutes (600 seconds)
    await redisClient.setEx(cacheKey, 600, JSON.stringify(products));
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CREATE PRODUCT (Includes Cache Invalidation)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId } = req.body;
    
    // Cloudinary provides the full secure URL in req.file.path
    const imageUrl = req.file ? req.file.path : null; 

    const product = await Product.create({
      name,
      // Use parseFloat and parseInt to ensure the database gets numbers, not strings
      price: parseFloat(price), 
      description,
      stock: parseInt(stock),
      categoryId: parseInt(categoryId),
      images: imageUrl 
    });

    res.status(201).json(product);
  } catch (error) {
    // This will help you see if the error is database-related (e.g., missing categoryId)
    console.error("Backend Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE PRODUCT (Includes Cache Invalidation)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.update(req.body);

    // NEW: Clear specific product cache and list cache
    await redisClient.del(`products:single:${id}`);
    await clearProductCache();

    res.status(200).json({ message: "Product updated", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. DELETE PRODUCT (Includes Cache Invalidation)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // File cleanup logic...
    await product.destroy();

    // NEW: Clear caches
    await redisClient.del(`products:single:${req.params.id}`);
    await clearProductCache();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. GET SINGLE PRODUCT (With Caching)
exports.getProductById = async (req, res) => {
  try {
    const cacheKey = `products:single:${req.params.id}`;
    
    const cachedProduct = await redisClient.get(cacheKey);
    if (cachedProduct) return res.status(200).json(JSON.parse(cachedProduct));

    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    await redisClient.setEx(cacheKey, 3600, JSON.stringify(product));
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};