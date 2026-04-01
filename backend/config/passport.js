const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User           = require('../models/User');
const jwt            = require('jsonwebtoken');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'https://khadi-bhandar-digitilization.onrender.com/api/auth/google/callback',
  passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails?.[0]?.value;
    if (!email) return done(new Error('No email from Google'), null);

    // Check if role=seller was passed in query
    const wantsSeller = req.query?.state === 'seller';

    let user = await User.findOne({ email });

    if (!user) {
      // New user — create account
      user = await User.create({
        name:         profile.displayName || email.split('@')[0],
        email,
        phone:        '',
        role:         wantsSeller ? 'seller' : 'customer',
        isActive:     true,
        googleId:     profile.id,
        authProvider: 'google',
      });
    } else {
      // Existing user — link Google if not linked
      if (!user.googleId) {
        user.googleId     = profile.id;
        user.authProvider = 'google';
        await user.save();
      }
    }

    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));

module.exports = passport;