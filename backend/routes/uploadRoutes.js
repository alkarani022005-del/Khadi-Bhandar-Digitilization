const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const { cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect } = require('../middleware/authMiddleware');

// Image storage
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'khadi_bhandar/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit', quality: 'auto' }],
    resource_type: 'image',
  }),
});

// Video storage
const videoStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'khadi_bhandar/videos',
    allowed_formats: ['mp4', 'webm', 'mov'],
    resource_type: 'video',
  }),
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, WEBP images allowed'), false);
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only MP4, WebM, MOV videos allowed'), false);
  }
};

const uploadImage  = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadVideo  = multer({ storage: videoStorage, fileFilter: videoFilter, limits: { fileSize: 100 * 1024 * 1024 } });
const uploadImages = multer({ storage: imageStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Single image
router.post('/image', protect, (req, res) => {
  uploadImage.single('image')(req, res, (err) => {
    if (err) {
      console.error('Image upload error:', err.message);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('Image uploaded:', req.file.path);
    res.json({ url: req.file.path, public_id: req.file.filename });
  });
});

// Multiple images
router.post('/images', protect, (req, res) => {
  uploadImages.array('images', 5)(req, res, (err) => {
    if (err) {
      console.error('Images upload error:', err.message);
      return res.status(400).json({ message: err.message || 'Upload failed' });
    }
    if (!req.files?.length) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    const urls = req.files.map(f => ({ url: f.path, public_id: f.filename }));
    res.json({ urls });
  });
});

// Video
router.post('/video', protect, (req, res) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      console.error('Video upload error:', err.message);
      return res.status(400).json({ message: err.message || 'Video upload failed' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    console.log('Video uploaded:', req.file.path);
    res.json({ url: req.file.path, public_id: req.file.filename });
  });
});

module.exports = router;