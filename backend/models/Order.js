const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  status: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    quantity: Number,
    size: String,
    color: String,
  }],
  shippingAddress: {
    name: String, street: String, city: String,
    state: String, pincode: String, phone: String,
  },
  paymentMethod: { type: String, default: 'cod', enum: ['cod', 'razorpay'] },
  paymentStatus: { type: String, default: 'Pending', enum: ['Pending', 'Paid', 'Failed'] },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  isPaid: { type: Boolean, default: false },
  isDelivered: { type: Boolean, default: false },
  status: {
    type: String, default: 'Processing',
    enum: ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
  },
  tracking: [trackingSchema],
  estimatedDelivery: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);