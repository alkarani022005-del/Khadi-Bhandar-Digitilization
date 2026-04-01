const express  = require('express');
const router   = express.Router();
const passport = require('../config/passport');
const jwt      = require('jsonwebtoken');
const {
  register, sendOtp, verifyOtp,
  getProfile, updateProfile, applyForSeller,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Existing OTP routes
router.post('/register',     register);
router.post('/send-otp',     sendOtp);
router.post('/verify-otp',   verifyOtp);
router.get('/profile',       protect, getProfile);
router.put('/profile',       protect, updateProfile);
router.post('/apply-seller', protect, applyForSeller);

// Google OAuth — pass role as state param
router.get('/google', (req, res, next) => {
  const role  = req.query.role || 'customer';
  const state = role === 'seller' ? 'seller' : 'customer';
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
    state,
  })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`
  }),
  (req, res) => {

    if (!req.user) {
      return res.redirect(process.env.FRONTEND_URL);
    }

    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.redirect(`${process.env.FRONTEND_URL}/auth/google/success?token=${token}`);
  }
);

module.exports = router;