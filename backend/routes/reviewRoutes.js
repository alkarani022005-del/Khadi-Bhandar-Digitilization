const express = require('express');
const router = express.Router();
const { getCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon } = require('../controllers/couponController');
const { addReview, getProductReviews, deleteReview } = require('../controllers/reviewController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/apply', protect, applyCoupon);
router.get('/', protect, admin, getCoupons);
router.post('/', protect, admin, createCoupon);
router.put('/:id', protect, admin, updateCoupon);
router.delete('/:id', protect, admin, deleteCoupon);

router.get('/:productId', getProductReviews);         // public
router.post('/', protect, addReview);                  // any logged in user
router.delete('/:id', protect, admin, deleteReview);  // admin only


module.exports = router;