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
    failureRedirect: '/'
  }),
  async (req, res) => {

    try {
      if (!req.user) {
        console.log("❌ No user from Google");
        return res.send("Login failed");
      }

      console.log("✅ Google user:", req.user);

      // ⚠️ SAFE ID (important)
      const userId = req.user._id || req.user.id || "tempUser";

      const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );

      // TEMP FIX (no frontend dependency)
      return res.send(`
        <h2>Login Successful 🎉</h2>
        <p>Token: ${token}</p>
      `);

    } catch (err) {
      console.log("🔥 ERROR:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

module.exports = router;