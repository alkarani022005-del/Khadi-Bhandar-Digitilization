const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

// Dashboard stats
const getDashboard = async (req, res) => {
  try {
    const totalUsers     = await User.countDocuments({ role: 'customer' });
    const totalSellers   = await User.countDocuments({ role: 'seller' });
    const pendingSellers = await User.countDocuments({
      role: 'seller',
      'sellerInfo.isApproved': false,
      'sellerInfo.isRejected': false,
      'sellerInfo.appliedAt': { $exists: true },
    });
    const totalProducts = await Product.countDocuments();
    const totalOrders   = await Order.countDocuments();
    const revenue = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalUsers, totalSellers, pendingSellers,
      totalProducts, totalOrders,
      revenue: revenue[0]?.total || 0,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'customer' }).sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all sellers
const getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' }).sort({ createdAt: -1 });
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve seller
const approveSeller = async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { 'sellerInfo.isApproved': true, 'sellerInfo.isRejected': false },
      { new: true }
    );
    res.json({ message: 'Seller approved successfully', seller });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reject seller
const rejectSeller = async (req, res) => {
  try {
    const seller = await User.findByIdAndUpdate(
      req.params.id,
      { 'sellerInfo.isRejected': true, 'sellerInfo.isApproved': false },
      { new: true }
    );
    res.json({ message: 'Seller rejected', seller });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Deactivate / activate user
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products (admin)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('seller', 'name email sellerInfo')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete any product
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getDashboard, getAllUsers, getAllSellers,
  approveSeller, rejectSeller, toggleUserStatus,
  getAllOrders, updateOrderStatus,
  getAllProducts, deleteProduct,
};