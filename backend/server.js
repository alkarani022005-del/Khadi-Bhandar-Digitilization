require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const passport = require('./config/passport');
const connectDB = require('./config/db');

connectDB();

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/auth/google/success', (req, res) => {
  res.send("Google Login Successful 🎉");
});
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/payment',  require('./routes/paymentRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/seller',   require('./routes/sellerRoutes'));
app.use('/api/site',     require('./routes/siteRoutes'));
app.use('/api/coupons',  require('./routes/couponRoutes'));
app.use('/api/reviews',  require('./routes/reviewRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/upload',   require('./routes/uploadRoutes'));

app.get('/', (req, res) => res.send('Banasthali Khadi Bhandar API ✅'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));