const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

router.use(verifyToken);

router.get('/', cartController.getCart);
router.post('/add', cartController.addItemToCart);
router.delete('/item/:productId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart); 

module.exports = router;