const { Review, User, Product } = require('../models');

// 1. ADD A REVIEW
exports.addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    // Check if the product exists
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = await Review.create({
      userId: req.user.id, // From Auth Middleware
      productId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. GET REVIEWS FOR A SPECIFIC PRODUCT
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { productId },
      include: [{ 
        model: User, 
        as: 'user', 
        attributes: ['name'] // Only send the reviewer's name
      }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. DELETE A REVIEW
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByPk(req.params.id);
    
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Ensure only the owner or an admin can delete it
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Unauthorized to delete this review" });
    }

    await review.destroy();
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};