const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', cartController.getCart);

// Line 9: Ensure cartController.addItemToCart is NOT undefined
router.post('/add', cartController.addItemToCart); 

router.delete('/item/:productId', cartController.removeFromCart);

router.delete('/clear', cartController.clearCart);

module.exports = router;