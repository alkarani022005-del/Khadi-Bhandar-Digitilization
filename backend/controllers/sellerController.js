const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// Get seller dashboard
const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);

    const orders = await Order.find({
      'items.product': { $in: productIds },
    });

    const totalOrders = orders.length;
    const revenue = orders
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => {
        const myItems = o.items.filter(i => productIds.some(pid => pid.toString() === i.product?.toString()));
        return sum + myItems.reduce((s, i) => s + i.price * i.quantity, 0);
      }, 0);

    res.json({ totalProducts, totalOrders, revenue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get seller's products
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add product
const addProduct = async (req, res) => {
  try {
    const seller = await User.findById(req.user.id);
    const product = await Product.create({
      ...req.body,
      seller: req.user.id,
      sellerName: seller.sellerInfo?.shopName || seller.name,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get seller's orders
const getMyOrders = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    const productIds = products.map(p => p._id);
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (seller can update their orders)
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

module.exports = {
  getSellerDashboard, getMyProducts,
  addProduct, updateProduct, deleteProduct,
  getMyOrders, updateOrderStatus,
};