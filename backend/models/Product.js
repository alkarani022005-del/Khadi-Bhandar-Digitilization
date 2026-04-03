const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  size:  { type: String, default: '' },
  color: { type: String, default: '' },
  stock: { type: Number, default: 0  },
  price: { type: Number, default: 0  },
});

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true },
  description:   { type: String, default: '' },
  price:         { type: Number, required: true },
  originalPrice: { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  category:      { type: String, default: 'General' }, // primary
  categories:    [{ type: String }],                   // multiple
  images:        [{ type: String }],
  videos:        [{ type: String }],
  stock:         { type: Number, default: 0 },
  rating:        { type: Number, default: 0 },
  numReviews:    { type: Number, default: 0 },
  isFeatured:    { type: Boolean, default: false },
  isActive:      { type: Boolean, default: true },
  seller:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sellerName:    { type: String, default: '' },
  variants:      [variantSchema],
  sizes:         [{ type: String }],
  colors:        [{ type: String }],
  tags:          [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);