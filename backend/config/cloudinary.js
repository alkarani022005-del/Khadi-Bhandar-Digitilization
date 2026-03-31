require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');


console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'loaded ✅' : 'MISSING ❌',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'loaded ✅' : 'MISSING ❌',
});


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
cloudinary.api.ping()
  .then(() => console.log('✅ Cloudinary connected'))
  .catch(err => console.log('❌ Cloudinary error:', err.message));

module.exports = { cloudinary };