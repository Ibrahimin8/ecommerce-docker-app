const express = require('express'); 
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // For handling receipt uploads

// Apply verifyToken to ALL routes below
router.use(verifyToken);

router.patch('/:id/upload-receipt', verifyToken, upload.single('receipt'), orderController.uploadReceipt);

// User and Admin (must be authenticated)
router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.patch('/cancel/:id', orderController.cancelOrder);
router.get('/:id', orderController.getOrderById);
router.post('/reorder/:id',  orderController.reorder);

// Admin only routes (must also pass isAdmin)
router.get('/admin/all', isAdmin, orderController.getAllOrders);
router.get('/admin/stats', isAdmin, orderController.getSalesStats);
router.get('/admin/top-sellers', isAdmin, orderController.getTopSellers);
router.patch('/admin/status/:id', isAdmin, orderController.updateOrderStatus);

module.exports = router;