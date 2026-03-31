const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { sendOrderEmail } = require('../config/mailer');

const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, couponCode } = req.body;
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user.cart.length) return res.status(400).json({ message: 'Cart is empty' });

    const items = user.cart.map(item => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.images?.[0] || '',
      price: item.product.price,
      quantity: item.quantity,
      size: item.size || '',
      color: item.color || '',
    }));

    let totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryCharge = totalPrice > 500 ? 0 : 50;
    let couponDiscount = 0;
    let appliedCoupon = '';

    // Apply coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
      if (coupon && totalPrice >= coupon.minOrderAmount) {
        if (coupon.discountType === 'percent') {
          couponDiscount = (totalPrice * coupon.discountValue) / 100;
          if (coupon.maxDiscount > 0) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
        } else {
          couponDiscount = coupon.discountValue;
        }
        couponDiscount = Math.round(couponDiscount);
        appliedCoupon = coupon.code;
        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
      }
    }

    const finalTotal = totalPrice + deliveryCharge - couponDiscount;
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const order = await Order.create({
      user: req.user.id,
      items,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      isPaid: paymentMethod !== 'cod',
      couponCode: appliedCoupon,
      couponDiscount,
      totalPrice: finalTotal,
      deliveryCharge,
      estimatedDelivery,
      tracking: [{
        status: 'Processing',
        message: 'Order placed successfully',
        timestamp: new Date(),
      }],
    });

    // Update stock
    for (const item of user.cart) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity },
      });
    }

    // Clear cart
    user.cart = [];
    await user.save();

    // Send email
    try {
      await sendOrderEmail(user.email, user.name, order);
    } catch (e) {
      console.log('Order email failed:', e.message);
    }

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const messages = {
      Confirmed: 'Your order has been confirmed',
      Shipped: 'Your order has been shipped and is on the way',
      Delivered: 'Your order has been delivered successfully',
      Cancelled: 'Your order has been cancelled',
    };

    order.status = status;
    order.tracking.push({
      status,
      message: messages[status] || `Order status updated to ${status}`,
      timestamp: new Date(),
    });

    if (status === 'Delivered') {
      order.isDelivered = true;
      order.isPaid = true;
      order.paymentStatus = 'Paid';
    }

    await order.save();

    // Send status email
    try {
      await sendStatusEmail(order.user.email, order.user.name, order);
    } catch (e) {
      console.log('Status email failed:', e.message);
    }

    res.json(order);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus };