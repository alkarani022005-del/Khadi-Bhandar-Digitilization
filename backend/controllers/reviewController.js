const Review  = require('../models/Review');
const Product = require('../models/Product');
const Order   = require('../models/Order');
const User    = require('../models/User');

const addReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId) return res.status(400).json({ message: 'Product ID required' });
    if (!rating)    return res.status(400).json({ message: 'Rating required' });

    // Always fetch fresh user from DB to get name
    const user = await User.findById(req.user._id || req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userName = user.name || 'Anonymous';

    // Check already reviewed
    const existing = await Review.findOne({
      product: productId,
      user: user._id,
    });
    if (existing) {
      return res.status(400).json({ message: 'You already reviewed this product' });
    }

    // Check verified purchase
    const order = await Order.findOne({
      user: user._id,
      'items.product': productId,
      status: 'Delivered',
    });

    const review = await Review.create({
      product: productId,
      user:    user._id,
      name:    userName,
      rating:  Number(rating),
      comment: comment || `Rated ${rating} star${rating > 1 ? 's' : ''}`,
      isVerifiedPurchase: !!order,
    });

    // Recalculate rating
    const allReviews = await Review.find({ product: productId });
    const avgRating  = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      rating:     Math.round(avgRating * 10) / 10,
      numReviews: allReviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('Review error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });
    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);
    const remaining = await Review.find({ product: productId });
    const avgRating = remaining.length
      ? remaining.reduce((s, r) => s + r.rating, 0) / remaining.length : 0;
    await Product.findByIdAndUpdate(productId, {
      rating:     Math.round(avgRating * 10) / 10,
      numReviews: remaining.length,
    });
    res.json({ message: 'Review deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { addReview, getProductReviews, deleteReview };