const express = require('express');
const router = express.Router();
const {
  getSellerDashboard, getMyProducts,
  addProduct, updateProduct, deleteProduct,
  getMyOrders, updateOrderStatus,
} = require('../controllers/sellerController');
const { protect, approvedSeller } = require('../middleware/authMiddleware');

router.use(protect, approvedSeller);

router.get('/dashboard', getSellerDashboard);
router.get('/products', getMyProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getMyOrders);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;