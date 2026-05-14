const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. UPDATED: Changed 'image' to 'images' to match frontend data.append('images', ...)
// 2. IMPORTANT: Removed the duplicate POST route at the bottom.
router.post('/', verifyToken, isAdmin, upload.single('images'), productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin Only - Removed the second POST '/' from here as it was redundant and missing the upload middleware
router.patch('/:id', verifyToken, isAdmin, upload.single('images'), productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;