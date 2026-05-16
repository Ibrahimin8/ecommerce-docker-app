const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Matches frontend 'image' key
router.post('/', verifyToken, isAdmin, upload.single('image'), productController.createProduct);

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Admin actions
router.patch('/:id', verifyToken, isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', verifyToken, isAdmin, productController.deleteProduct);
router.put('/:id', verifyToken, isAdmin, upload.single('image'), productController.updateProduct);

module.exports = router;