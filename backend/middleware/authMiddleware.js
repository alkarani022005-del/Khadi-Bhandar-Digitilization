const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Include name in req.user (removed -cart select to keep name)
      req.user = await User.findById(decoded.id).select('-cart');
      next();
    } catch {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ message: 'Admin access only' });
};

const seller = (req, res, next) => {
  if (req.user && (req.user.role === 'seller' || req.user.role === 'admin')) next();
  else res.status(403).json({ message: 'Seller access only' });
};

const approvedSeller = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  if (req.user && req.user.role === 'seller' && req.user.sellerInfo?.isApproved) return next();
  res.status(403).json({ message: 'Approved seller access only' });
};

module.exports = { protect, admin, seller, approvedSeller };