const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Add 'upload.single' or 'upload.array' before the controller
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin Only
router.post('/', verifyToken, isAdmin, productController.createProduct);
router.patch('/:id', verifyToken, isAdmin, productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);

module.exports = router;