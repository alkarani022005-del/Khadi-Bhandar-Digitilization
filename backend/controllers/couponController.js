const Coupon = require('../models/Coupon');

const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const createCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.create({
      ...req.body,
      code: req.body.code.toUpperCase(),
    });
    res.status(201).json(coupon);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(coupon);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: 'Coupon deleted' });
  } catch (err) { res.status(400).json({ message: err.message }); }
};

const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) return res.status(404).json({ message: 'Invalid coupon code' });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    if (coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`,
      });
    }

    let discount = 0;
    if (coupon.discountType === 'percent') {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.round(discount);

    res.json({
      success: true,
      discount,
      code: coupon.code,
      message: `Coupon applied! You save ₹${discount}`,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, applyCoupon };