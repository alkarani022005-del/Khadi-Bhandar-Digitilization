const Wishlist = require('../models/Wishlist');

const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id })
      .populate('products');
    res.json(wishlist?.products || []);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
      return res.json({ added: true, message: 'Added to wishlist' });
    }

    const exists = wishlist.products.includes(productId);
    if (exists) {
      wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
      await wishlist.save();
      return res.json({ added: false, message: 'Removed from wishlist' });
    } else {
      wishlist.products.push(productId);
      await wishlist.save();
      return res.json({ added: true, message: 'Added to wishlist' });
    }
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getWishlist, toggleWishlist };