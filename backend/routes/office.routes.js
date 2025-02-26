const express = require('express');
const router = express.Router();
const { auth, isOwner } = require('../middleware/auth.middleware');
const handleUpload = require('../middleware/upload.middleware');
const {
  createOffice,
  getBuildingOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
  searchOffices,
  searchPublicOffices,
  uploadImages,
  deleteImage,
  getPublicBuildingOffices,
  getPublicOfficeById
} = require('../controllers/office.controller');

// Public routes - most specific routes first
router.get('/public/search', searchPublicOffices);
router.get('/public/building/:buildingId', getPublicBuildingOffices);  // Use new public controller
router.get('/public/:id', getPublicOfficeById);                // Generic ID route last, using public controller

// Protected routes - require authentication and owner role
router.use(auth, isOwner);

// Create new office
router.post('/', handleUpload, createOffice);

// Search offices within a building
router.get('/search', searchOffices);

// Upload images to office
router.post('/:id/images', handleUpload, uploadImages);

// Delete image from office
router.delete('/:id/images/:imageUrl', deleteImage);

// Get single office
router.get('/:id', getOfficeById);

// Update office
router.put('/:id', updateOffice);

// Delete office
router.delete('/:id', deleteOffice);

module.exports = router;
