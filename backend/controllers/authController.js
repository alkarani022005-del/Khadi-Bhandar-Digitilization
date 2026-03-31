const User = require('../models/User');
const Otp = require('../models/Otp');
const generateOtp = require('../utils/generateOtp');
const { sendOtpEmail } = require('../config/mailer');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const register = async (req, res) => {
  try {
    console.log('📝 Register body:', req.body);

    const { name, email, phone, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email required' });
    }

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered. Please login.' });
    }

    // Create user
    const userRole = role === 'seller' ? 'seller' : 'customer';
    const newUser = await User.create({
      name,
      email,
      phone: phone || '',
      role: userRole,
    });
    console.log('✅ User created:', newUser._id);

    // Generate and save OTP
    const otp = generateOtp();
    console.log('🔢 OTP generated:', otp);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });
    console.log('✅ OTP saved to DB');

    // Send email
    await sendOtpEmail(email, otp);
    console.log('✅ OTP email sent to:', email);

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: err.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    console.log('📧 SendOTP body:', req.body);

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found. Please register first.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated. Contact admin.' });
    }

    const otp = generateOtp();
    console.log('🔢 OTP for login:', otp);

    await Otp.deleteMany({ email });
    await Otp.create({ email, otp });

    await sendOtpEmail(email, otp);
    console.log('✅ Login OTP sent to:', email);

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('❌ SendOTP error:', err.message);
    res.status(500).json({ message: err.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log('Verifying OTP:', { email, otp, type: typeof otp }); // debug

    // Find all OTPs for this email
    const allOtps = await Otp.find({ email });
    console.log('OTPs in DB for this email:', allOtps); // debug

    // Compare as strings
    const record = await Otp.findOne({ 
      email: email.toLowerCase().trim(), 
      otp: String(otp).trim() 
    });

    console.log('Matched record:', record); // debug

    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await Otp.deleteMany({ email });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        sellerInfo: user.sellerInfo,
      },
    });
  } catch (err) {
    console.error('VerifyOTP error:', err);
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id, req.body, { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const applyForSeller = async (req, res) => {
  try {
    const { shopName, shopDescription, gstin, aadhaarNumber, panNumber, bankAccount, ifsc } = req.body;

    if (!shopName) return res.status(400).json({ message: 'Shop name is required' });
    if (!aadhaarNumber) return res.status(400).json({ message: 'Aadhaar number is required' });
    if (!panNumber) return res.status(400).json({ message: 'PAN number is required' });
    if (!bankAccount) return res.status(400).json({ message: 'Bank account is required' });
    if (!ifsc) return res.status(400).json({ message: 'IFSC code is required' });

    // Validate Aadhaar — 12 digits
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      return res.status(400).json({ message: 'Aadhaar number must be exactly 12 digits' });
    }

    // Validate PAN — format: ABCDE1234F
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      return res.status(400).json({ message: 'Invalid PAN format (e.g. ABCDE1234F)' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        role: 'seller',
        sellerInfo: {
          shopName,
          shopDescription,
          gstin,
          aadhaarNumber,
          panNumber: panNumber.toUpperCase(),
          bankAccount,
          ifsc: ifsc.toUpperCase(),
          isApproved: false,
          isRejected: false,
          appliedAt: new Date(),
        },
      },
      { new: true }
    );

    res.json({ message: 'Seller application submitted! Awaiting admin approval.', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, sendOtp, verifyOtp, getProfile, updateProfile, applyForSeller };