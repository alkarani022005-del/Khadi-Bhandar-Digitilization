const express = require('express');
const router = express.Router();
const {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getCart, addToCart, updateCartItem, removeFromCart,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/cart/items', protect, getCart);
router.post('/cart/add', protect, addToCart);
router.put('/cart/update/:productId', protect, updateCartItem);
router.delete('/cart/remove/:productId', protect, removeFromCart);

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;