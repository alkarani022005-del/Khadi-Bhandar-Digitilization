const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const {
  getDashboard, getAllUsers, getAllSellers,
  approveSeller, rejectSeller, toggleUserStatus,
  getAllOrders, updateOrderStatus,
  getAllProducts, deleteProduct,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// Banner image upload — local storage
const bannerDir = path.join(__dirname, '../uploads/banners');
if (!fs.existsSync(bannerDir)) fs.mkdirSync(bannerDir, { recursive: true });

const bannerUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, bannerDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `banner_${Date.now()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPG, PNG, WEBP allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(protect, admin);

router.get('/dashboard',          getDashboard);
router.get('/users',              getAllUsers);
router.get('/sellers',            getAllSellers);
router.put('/sellers/:id/approve', approveSeller);
router.put('/sellers/:id/reject',  rejectSeller);
router.put('/users/:id/toggle',    toggleUserStatus);
router.get('/orders',             getAllOrders);
router.put('/orders/:id/status',  updateOrderStatus);
router.get('/products',           getAllProducts);
router.delete('/products/:id',    deleteProduct);

// Banner upload route
router.post('/upload/banner', bannerUpload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const url = `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/banners/${req.file.filename}`;
  console.log('✅ Banner uploaded:', url);
  res.json({ url });
});

module.exports = router;