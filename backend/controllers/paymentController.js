const crypto = require('crypto');
const Order = require('../models/Order');

const createOrder = async (req, res) => {
  try {
    const razorpay = require('../config/razorpay');

    if (!razorpay) {
      return res.status(503).json({ message: 'Payment gateway not configured. Please add Razorpay keys to .env' });
    }

    const { amount } = req.body;
    const options = {
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('Razorpay error:', err);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paymentStatus: 'Paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    res.json({ success: true, message: 'Payment verified' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment };