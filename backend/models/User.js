const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, default: 1 },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  googleId:     { type: String, default: '' },
authProvider: { type: String, default: 'email', enum: ['email', 'google'] },
  phone: { type: String, default: '' }, // NO unique here
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  role: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer',
  },
  sellerInfo: {
    shopName:        { type: String, default: '' },
    shopDescription: { type: String, default: '' },
    gstin:           { type: String, default: '' },
    aadhaarNumber:   { type: String, default: '' },
    panNumber:       { type: String, default: '' },
    bankAccount:     { type: String, default: '' },
    ifsc:            { type: String, default: '' },
    isApproved:      { type: Boolean, default: false },
    isRejected:      { type: Boolean, default: false },
    appliedAt:       { type: Date, default: null },
  },
  cart: [cartItemSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);