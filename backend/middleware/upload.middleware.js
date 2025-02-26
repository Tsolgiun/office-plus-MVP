const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'office-plus',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: "limit" }] // Resize large images
  }
});

// Configure multer
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Handle multiple file uploads
const uploadImages = upload.array('photos', 10); // Max 10 images

// Middleware wrapper for better error handling
const handleUpload = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        message: 'File upload error',
        error: err.message
      });
    } else if (err) {
      return res.status(400).json({
        message: 'Invalid file type',
        error: err.message
      });
    }
    next();
  });
};

module.exports = handleUpload;
