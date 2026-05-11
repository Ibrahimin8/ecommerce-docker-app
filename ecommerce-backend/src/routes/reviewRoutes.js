const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public can view reviews
router.get('/product/:productId', reviewController.getProductReviews);

// Only logged in users can post or delete their reviews
router.post('/', verifyToken, reviewController.addReview);
router.delete('/:id', verifyToken, reviewController.deleteReview);

module.exports = router;