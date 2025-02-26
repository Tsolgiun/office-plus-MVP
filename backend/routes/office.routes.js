const express = require('express');
const router = express.Router();
const { auth, isOwner } = require('../middleware/auth.middleware');
const {
  createOffice,
  getBuildingOffices,
  getOfficeById,
  updateOffice,
  deleteOffice,
  searchOffices,
  searchPublicOffices
} = require('../controllers/office.controller');

// Public routes
router.get('/public/search', searchPublicOffices);

// Protected routes - require authentication and owner role
router.use(auth, isOwner);

// Create new office
router.post('/', createOffice);

// Get all offices in a building
router.get('/building/:buildingId', getBuildingOffices);

// Search offices within a building
router.get('/search', searchOffices);

// Get single office
router.get('/:id', getOfficeById);

// Update office
router.put('/:id', updateOffice);

// Delete office
router.delete('/:id', deleteOffice);

module.exports = router;
