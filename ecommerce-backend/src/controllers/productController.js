const { Product, Category } = require('../models');
const { Op } = require('sequelize');
const redisClient = require('../config/redis'); 

// Helper to clear product-related cache
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

// 1. VIEW ALL PRODUCTS (With Caching)
exports.getAllProducts = async (req, res) => {
  try {
    const { categoryId, search } = req.query;
    const cacheKey = `products:all:cat${categoryId || 'none'}:search${search || 'none'}`;

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

    // Cache for 10 minutes
    await redisClient.setEx(cacheKey, 600, JSON.stringify(products));
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. CREATE PRODUCT (Fixed with Cache Invalidation)
exports.createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, categoryId } = req.body;
    const imageUrl = req.file ? req.file.path : req.body.imageUrl;

    if (!imageUrl) {
      return res.status(400).json({ message: "Product image is required." });
    }

    const product = await Product.create({
      name,
      price: parseFloat(price), 
      description,
      stock: parseInt(stock),
      categoryId: parseInt(categoryId),
      images: imageUrl 
    });

    // PERMANENT FIX: Clear cache so the new product shows up immediately
    await clearProductCache();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. UPDATE PRODUCT (Includes Cache Invalidation)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Handle numeric conversions for safety
    const updateData = { ...req.body };
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    await product.update(updateData);

    // Clear caches
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

    await product.destroy();

    // Clear caches
    await redisClient.del(`products:single:${req.params.id}`);
    await clearProductCache();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. GET SINGLE PRODUCT
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