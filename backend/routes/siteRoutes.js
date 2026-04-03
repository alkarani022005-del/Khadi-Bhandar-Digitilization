const express = require('express');
const router  = require('express').Router();
const multer  = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');
const {
  getBanners, getAllBanners, createBanner, updateBanner, deleteBanner,
  getCategories, getAllCategories, createCategory, updateCategory, deleteCategory,
  getSettings, updateSetting,
} = require('../controllers/siteController');
const { protect, admin } = require('../middleware/authMiddleware');

// Create upload middleware directly here
const siteStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'khadi_bhandar/site',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 600, crop: 'limit', quality: 'auto' }],
    resource_type: 'image',
  }),
});

const upload = multer({
  storage: siteStorage,
  fileFilter: (req, file, cb) => {
    ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only JPG, PNG, WEBP allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── Public ──
router.get('/banners',    getBanners);
router.get('/categories', getCategories);
router.get('/settings',   getSettings);

// ── Admin ──
router.get('/banners/all',    protect, admin, getAllBanners);
router.post('/banners',       protect, admin, upload.single('image'), createBanner);
router.put('/banners/:id',    protect, admin, upload.single('image'), updateBanner);
router.delete('/banners/:id', protect, admin, deleteBanner);

router.get('/categories/all',    protect, admin, getAllCategories);
router.post('/categories',       protect, admin, upload.single('image'), createCategory);
router.put('/categories/:id',    protect, admin, upload.single('image'), updateCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

router.put('/settings', protect, admin, updateSetting);

module.exports = router;